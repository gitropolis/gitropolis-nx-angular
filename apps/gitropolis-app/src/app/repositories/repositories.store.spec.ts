import { TestBed } from '@angular/core/testing';
import {
  asyncScheduler,
  firstValueFrom,
  from,
  NEVER,
  scheduled,
  skip,
} from 'rxjs';

import { FakeOctokitLinks } from '../github/fake-octokit-links';
import { loadAuthenticatedRepositoriesToken } from './load-authenticated-repositories';
import { RepositoriesStore } from './repositories.store';
import { Repository } from './repository';

import type { LoadAuthenticatedRepositoriesResponse } from './load-authenticated-repositories';

describe(RepositoriesStore.name, () => {
  const angular: Repository = {
    description: 'The modern web developer’s platform',
    fullName: 'angular/angular',
    url: 'https://github.com/angular/angular',
  };
  const ngrx: Repository = {
    description: 'Reactive libraries for Angular',
    fullName: 'ngrx/platform',
    url: 'https://github.com/ngrx/platform',
  };
  const nx: Repository = {
    description: 'Smart, Fast and Extensible Build System',
    fullName: 'nrwl/nx',
    url: 'https://github.com/nrwl/nx',
  };
  const rxangular: Repository = {
    description: 'Reactive Extensions for Angular.',
    fullName: 'rx-angular/rx-angular',
    url: 'https://github.com/rx-angular/rx-angular',
  };
  const rxjs: Repository = {
    description: 'A reactive programming library for JavaScript',
    fullName: 'ReactiveX/rxjs',
    url: 'https://github.com/ReactiveX/rxjs',
  };
  const typescript: Repository = {
    description:
      'TypeScript is a superset of JavaScript that compiles to clean JavaScript output.',
    fullName: 'microsoft/TypeScript',
    url: 'https://github.com/microsoft/TypeScript',
  };

  function setup(
    repositories?: readonly LoadAuthenticatedRepositoriesResponse[]
  ) {
    TestBed.configureTestingModule({
      providers: [
        RepositoriesStore,
        {
          provide: loadAuthenticatedRepositoriesToken,
          useValue: () =>
            repositories !== undefined
              ? scheduled(from(repositories), asyncScheduler)
              : NEVER,
        },
      ],
    });

    return {
      store: TestBed.inject(RepositoriesStore),
    };
  }

  const userReposEndpointPath = 'user/repos';

  describe('authenticatedRepositories$', () => {
    it(`
    Given no loaded repositories
    Then an empty array is emitted`, async () => {
      const { store } = setup();

      const repositories = await firstValueFrom(
        store.authenticatedRepositories$
      );

      expect(repositories).toEqual([]);
    });

    it(`
    Given a single page of 3 repositories
    Then those 3 repositories are emitted`, async () => {
      const fakeRepositoriesResponse: LoadAuthenticatedRepositoriesResponse = {
        links: FakeOctokitLinks.from({
          endpointPath: userReposEndpointPath,
          numberOfPages: 1,
          pageNumber: 1,
          pageSize: 3,
        }),
        repositories: [angular, ngrx, nx],
      };
      const { store } = setup([fakeRepositoriesResponse]);

      const repositories = await firstValueFrom(
        store.authenticatedRepositories$.pipe(skip(1))
      );

      expect(repositories).toEqual(fakeRepositoriesResponse.repositories);
    });

    it(`
    Given 3 pages of 2 repositories
    Then all 6 repositories are eventually emitted`, async () => {
      const numberOfPages = 3;
      const pageSize = 2;
      const fakeRepositoriesResponses: readonly LoadAuthenticatedRepositoriesResponse[] =
        [
          {
            links: FakeOctokitLinks.from({
              endpointPath: userReposEndpointPath,
              numberOfPages,
              pageNumber: 1,
              pageSize,
            }),
            repositories: [angular, ngrx],
          },
          {
            links: FakeOctokitLinks.from({
              endpointPath: userReposEndpointPath,
              numberOfPages,
              pageNumber: 2,
              pageSize,
            }),
            repositories: [nx, rxangular],
          },
          {
            links: FakeOctokitLinks.from({
              endpointPath: userReposEndpointPath,
              numberOfPages,
              pageNumber: 3,
              pageSize,
            }),
            repositories: [rxjs, typescript],
          },
        ];
      const { store } = setup(fakeRepositoriesResponses);

      const repositoriesPage1 = firstValueFrom(
        store.authenticatedRepositories$.pipe(skip(1))
      );
      const repositoriesPages1Through2 = firstValueFrom(
        store.authenticatedRepositories$.pipe(skip(2))
      );
      const repositoriesPages1Through3 = firstValueFrom(
        store.authenticatedRepositories$.pipe(skip(3))
      );

      expect(await repositoriesPage1).toEqual([angular, ngrx]);
      expect(await repositoriesPages1Through2).toEqual([
        angular,
        ngrx,
        nx,
        rxangular,
      ]);
      expect(await repositoriesPages1Through3).toEqual([
        angular,
        ngrx,
        nx,
        rxangular,
        rxjs,
        typescript,
      ]);
    });
  });
});
