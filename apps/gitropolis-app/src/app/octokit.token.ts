import { inject, InjectionToken } from '@angular/core';
import { Octokit } from '@octokit/rest';

import { githubAuthenticationToken } from './github-authentication.token';

export const octokitToken = new InjectionToken<Octokit>('octokitToken', {
  factory: () =>
    new Octokit({
      auth: inject(githubAuthenticationToken),
    }),
  providedIn: 'root',
});
