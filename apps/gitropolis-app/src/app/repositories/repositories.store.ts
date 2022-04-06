import { Inject, Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { concatMap, EMPTY, expand, map, Observable, pipe, scan, tap } from 'rxjs';

import {
  LoadAuthenticatedRepositoriesFn,
  LoadAuthenticatedRepositoriesOptions,
  LoadAuthenticatedRepositoriesResponse,
  loadAuthenticatedRepositoriesToken,
} from './load-authenticated-repositories';
import { Repositories } from './repository';

interface RepositoriesState {
  readonly repositories: Repositories;
}

@Injectable()
export class RepositoriesStore extends ComponentStore<RepositoriesState> {
  authenticatedRepositories$: Observable<Repositories> = this.select(
    (state) => state.repositories
  );

  constructor(
    @Inject(loadAuthenticatedRepositoriesToken)
    private loadAuthenticatedRepositories: LoadAuthenticatedRepositoriesFn
  ) {
    super(initialState);

    this.#loadRepositories();
  }

  #loadRepositories = this.effect<void>(
    pipe(
      concatMap(() =>
        this.#loadRepositoriesPage().pipe(
          // Recurse until there are no more pages.
          expand(({ links }) =>
            links.isLastPage
              ? EMPTY
              : this.#loadRepositoriesPage({ pageNumber: links.nextPageNumber })
          )
        )
      ),
      map(({ repositories }) => repositories),
      scan(
        (storedRepositories, repositories) => [
          ...storedRepositories,
          ...repositories,
        ],
        [] as Repositories
      ),
      tap((repositories) => this.#updateRepositories(repositories))
    )
  );
  #updateRepositories = this.updater<Repositories>(
    (state, repositories): RepositoriesState => ({
      ...state,
      repositories,
    })
  );
  #loadRepositoriesPage({
    pageNumber,
  }: LoadAuthenticatedRepositoriesOptions = {}): Observable<LoadAuthenticatedRepositoriesResponse> {
    return this.loadAuthenticatedRepositories({
      pageNumber,
    }).pipe(
      tapResponse(
        () => undefined,
        (error: unknown) => {
          console.error(String(error));
        }
      )
    );
  }
}

const initialState: RepositoriesState = {
  repositories: [],
};
