import { Inject, Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, filter, map, pipe } from 'rxjs';

import {
  LoadAuthenticatedRepositoriesFn,
  loadAuthenticatedRepositoriesToken,
} from './load-authenticated-repositories';
import { Repositories } from './repository';

interface Pagination {
  readonly lastPageNumber: number | null;
  readonly nextPageNumber: number | null;
}

interface RepositoriesState {
  readonly pagination: Pagination;
  readonly repositories: Repositories;
}

const isLastPage = ({ lastPageNumber, nextPageNumber }: Pagination): boolean =>
  lastPageNumber === null && nextPageNumber === null;

@Injectable()
export class RepositoriesStore extends ComponentStore<RepositoriesState> {
  authenticatedRepositories$ = this.select((state) => state.repositories);

  constructor(
    @Inject(loadAuthenticatedRepositoriesToken)
    private loadAuthenticatedRepositories: LoadAuthenticatedRepositoriesFn
  ) {
    super(initialState);

    this.#loadRepositoriesOnNextPage(this.select((state) => state.pagination));
  }

  #appendRepositories = this.updater<Repositories>(
    (state, loadedRepositories): RepositoriesState => ({
      ...state,
      repositories: [...state.repositories, ...loadedRepositories],
    })
  );
  #loadRepositoriesOnNextPage = this.effect<Pagination>(
    pipe(
      filter((pagination) => !isLastPage(pagination)),
      map(({ nextPageNumber }) => nextPageNumber as number),
      concatMap((nextPageNumber) =>
        this.loadAuthenticatedRepositories({
          pageNumber: nextPageNumber,
        }).pipe(
          tapResponse(
            ({ links, repositories }) => {
              this.#appendRepositories(repositories);

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
