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

type OctokitPageNumber = number;
type OctokitPageSize = number;
type OctokitReposSortColumn = 'created' | 'updated' | 'pushed' | 'full_name';
type OcotkitSortDirection = 'asc' | 'desc';

@Injectable()
export class RepositoriesStore extends ComponentStore<RepositoriesState> {
  #page: Observable<PageEvent | null> = this.select(
    (state) => state.materialPage,
    {
      debounce: true,
    }
  );
  #octokitPageNumber: Observable<OctokitPageNumber> = this.select(
    this.#page,
    (page) => {
      const defaultPageNumber = 1;

      if (page === null) {
        return defaultPageNumber;
      }

      return page.pageIndex + 1;
    }
  );
  #octokitPageSize: Observable<OctokitPageSize> = this.select(
    this.#page,
    (page) => {
      const defaultPageSize = 10;

      return page?.pageSize ?? defaultPageSize;
    }
  );

  #sort: Observable<Sort | null> = this.select((state) => state.materialSort);
  #octoKitSortColumn: Observable<OctokitReposSortColumn> = this.select(
    this.#sort,
    (sort): OctokitReposSortColumn => {
      const fullNameColumn = 'full_name';
      const defaultSortColumn = fullNameColumn;

      if (sort === null) {
        return defaultSortColumn;
      }

      switch (sort.active) {
        case 'created':
          return 'created';
        case 'full_name':
        // Fall through to 'fullName'
        case 'fullName':
          return fullNameColumn;
        case 'updated':
          return 'updated';
        case 'pushed':
          return 'pushed';
        case '':
        // Fall through to default
        default:
          return defaultSortColumn;
      }
    }
  );
  #octokitSortDirection: Observable<OcotkitSortDirection> = this.select(
    this.#sort,
    this.#octoKitSortColumn,
    (sort, ocotokitSortColumn): OcotkitSortDirection => {
      const sortDirection = sort?.direction ?? '';
      const hasDirection = ['asc', 'desc'].includes(sortDirection);

      if (hasDirection) {
        return sortDirection as 'asc' | 'desc';
      }

      const fullNameDefaultDirection = 'asc';
      const otherColumnDefaultDirection = 'desc';

      return ocotokitSortColumn === 'full_name'
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
                    ({ description, full_name: fullName, html_url: url }) => ({
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
  materialSort: null,
  repositories: [],
};
