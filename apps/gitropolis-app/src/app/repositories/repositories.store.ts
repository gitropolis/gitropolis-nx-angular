import { Inject, Injectable } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Octokit } from '@octokit/rest';
import { from, Observable, pipe, switchMap } from 'rxjs';

import { octokitToken } from '../octokit.token';
import { Repositories } from './repository';

interface RepositoriesState {
  readonly materialPage: PageEvent | null;
  readonly materialSort: Sort | null;
  readonly repositories: Repositories;
}

type OctokitPageNumber = number | undefined;
type OctokitPageSize = number | undefined;
type OctokitReposSortColumn =
  | 'created'
  | 'updated'
  | 'pushed'
  | 'full_name'
  | undefined;
type OcotkitSortDirection = 'asc' | 'desc' | undefined;

@Injectable()
export class RepositoriesStore extends ComponentStore<RepositoriesState> {
  #page: Observable<PageEvent | null> = this.select(
    (state) => state.materialPage
  );
  #octokitPageNumber: Observable<OctokitPageNumber> = this.select(
    this.#page,
    (page) => {
      if (page === null) {
        return undefined;
      }

      return page.pageIndex + 1;
    }
  );
  #octokitPageSize: Observable<OctokitPageSize> = this.select(
    this.#page,
    (page) => page?.pageSize
  );

  #sort: Observable<Sort | null> = this.select((state) => state.materialSort);
  #octoKitSortColumn: Observable<OctokitReposSortColumn> = this.select(
    this.#sort,
    (sort): OctokitReposSortColumn => {
      const noSortColumn = undefined;

      if (sort === null) {
        return noSortColumn;
      }

      switch (sort.active) {
        case 'created':
          return 'created';
        case 'full_name':
        // Fall through to 'fullName'
        case 'fullName':
          return 'full_name';
        case 'updated':
          return 'updated';
        case 'pushed':
          return 'pushed';
        case '':
        // Fall through to default
        default:
          return noSortColumn;
      }
    }
  );
  #octokitSortDirection: Observable<OcotkitSortDirection> = this.select(
    this.#sort,
    (sort): OcotkitSortDirection => {
      const noDirection = undefined;

      if (sort === null) {
        return undefined;
      }

      const hasDirection = ['asc', 'desc'].includes(sort.direction);

      if (hasDirection) {
        return sort.direction as 'asc' | 'desc';
      }

      const hasActiveColumn = sort.active !== '';

      if (!hasActiveColumn) {
        return noDirection;
      }

      const fullNameDefaultDirection = 'asc';
      const otherColumnDefaultDirection = 'desc';

      return sort.active === 'fullName'
        ? fullNameDefaultDirection
        : otherColumnDefaultDirection;
    }
  );

  authenticatedRepositories$ = this.select((state) => state.repositories);

  constructor(@Inject(octokitToken) private octokit: Octokit) {
    super(initialState);

    this.#loadRepositories(
      this.select(
        this.#octoKitSortColumn,
        this.#octokitSortDirection,
        this.#octokitPageNumber,
        this.#octokitPageSize,
        (column, direction, pageNumber, pageSize) => ({
          column,
          direction,
          pageNumber,
          pageSize,
        })
      )
    );
  }

  /**
   * Connect `MatPaginator#page` to the store.
   */
  onPaginate = this.updater<PageEvent>(
    (state, page): RepositoriesState => ({ ...state, materialPage: page })
  );
  /**
   * Connect `MatSort#sortChange` to the store.
   */
  onSort = this.updater<Sort>(
    (state, sort): RepositoriesState => ({ ...state, materialSort: sort })
  );

  #loadRepositories = this.effect<{
    readonly column: OctokitReposSortColumn;
    readonly direction: OcotkitSortDirection;
    readonly pageNumber: OctokitPageNumber;
    readonly pageSize: OctokitPageSize;
  }>(
    pipe(
      switchMap(
        ({ direction, pageNumber: page, pageSize: per_page, column: sort }) =>
          from(
            this.octokit.rest.repos.listForAuthenticatedUser({
              direction,
              page,
              per_page,
              sort,
            })
          ).pipe(
            tapResponse(
              (response) =>
                this.#updateRepositories(
                  response.data.map(
                    ({ description, full_name: fullName, url }) => ({
                      description: description ?? '',
                      fullName,
                      url,
                    })
                  )
                ),
              (error: unknown) => {
                console.error(String(error));

                this.#updateRepositories([]);
              }
            )
          )
      )
    )
  );
  #updateRepositories = this.updater<Repositories>(
    (state, repositories): RepositoriesState => ({
      ...state,
      repositories,
    })
  );
}

const initialState: RepositoriesState = {
  materialPage: null,
  repositories: [],
  materialSort: null,
};
