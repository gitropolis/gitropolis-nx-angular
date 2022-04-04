import { Inject, Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { Octokit } from '@octokit/rest';
import { concatMap, EMPTY, from, pipe } from 'rxjs';

import { OctokitLinks } from '../github/octokit-link';
import { octokitToken } from '../octokit.token';
import { Repositories } from './repository';

interface Pagination {
  readonly lastPageNumber: number | null;
  readonly nextPageNumber: number | null;
}

interface RepositoriesState {
  readonly pagination: Pagination;
  readonly repositories: Repositories;
}

@Injectable()
export class RepositoriesStore extends ComponentStore<RepositoriesState> {
  authenticatedRepositories$ = this.select((state) => state.repositories);

  constructor(@Inject(octokitToken) private octokit: Octokit) {
    super(initialState);

    this.#loadRepositories(this.select((state) => state.pagination));
  }

  #appendRepositories = this.updater<Repositories>(
    (state, loadedRepositories): RepositoriesState => ({
      ...state,
      repositories: [...state.repositories, ...loadedRepositories],
    })
  );
  #loadRepositories = this.effect<Pagination>(
    pipe(
      concatMap(({ lastPageNumber, nextPageNumber }) =>
        lastPageNumber === null && nextPageNumber === null
          ? EMPTY
          : from(
              this.octokit.rest.repos.listForAuthenticatedUser({
                page: nextPageNumber ?? undefined,
                per_page: 100,
              })
            ).pipe(
              tapResponse(
                ({ data, headers }) => {
                  this.#appendRepositories(
                    data.map(
                      ({
                        description,
                        full_name: fullName,
                        html_url: url,
                      }) => ({
                        description: description ?? '',
                        fullName,
                        url,
                      })
                    )
                  );

                  const links = OctokitLinks.fromLinkHeader(headers.link ?? '');
                  this.#updatePagination({
                    lastPageNumber: links.lastPageNumber,
                    nextPageNumber: links.nextPageNumber,
                  });
                },
                (error: unknown) => {
                  console.error(String(error));
                }
              )
            )
      )
    )
  );
  #updatePagination = this.updater<Pagination>((state, pagination) => ({
    ...state,
    pagination,
  }));
}

const initialState: RepositoriesState = {
  pagination: {
    nextPageNumber: 1,
    lastPageNumber: null,
  },
  repositories: [],
};
