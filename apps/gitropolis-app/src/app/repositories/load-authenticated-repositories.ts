import { inject, InjectionToken } from '@angular/core';
import { from, map, Observable } from 'rxjs';

import { OctokitLinks } from '../github/octokit-link';
import { octokitToken } from '../octokit.token';
import { Repositories } from './repository';

export interface LoadAuthenticatedRepositoriesOptions {
  /**
   * The numbered page of repositories to load.
   *
   * Defaults to the first page.
   */
  readonly pageNumber?: number | null;
}
export interface LoadAuthenticatedRepositoriesResponse {
  /**
   * The links parsed from the response.
   */
  readonly links: OctokitLinks;
  /**
   * The loaded repositories page.
   */
  readonly repositories: Repositories;
}

export type LoadAuthenticatedRepositoriesFn = (
  options?: LoadAuthenticatedRepositoriesOptions
) => Observable<LoadAuthenticatedRepositoriesResponse>;

function loadAuthenticatedRepositoriesFactory(): LoadAuthenticatedRepositoriesFn {
  const octokit = inject(octokitToken);

  const firstPage = undefined;

  return ({ pageNumber } = {}) =>
    from(
      octokit.rest.repos.listForAuthenticatedUser({
        page: pageNumber ?? firstPage,
        per_page: 100,
      })
    ).pipe(
      map(({ data, headers }) => ({
        links: OctokitLinks.fromLinkHeader(headers.link ?? ''),
        repositories: data.map(
          ({ description, full_name: fullName, html_url: url }) => ({
            description: description ?? '',
            fullName,
            url,
          })
        ),
      }))
    );
}

export const loadAuthenticatedRepositoriesToken =
  new InjectionToken<LoadAuthenticatedRepositoriesFn>(
    'loadAuthenticatedRepositoriesToken',
    {
      factory: loadAuthenticatedRepositoriesFactory,
      providedIn: 'root',
    }
  );
