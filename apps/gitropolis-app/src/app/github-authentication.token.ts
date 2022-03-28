import { InjectionToken } from '@angular/core';

function askUserForPersonalAccessToken(): string {
  let personalAccessToken: string | null = null;

  do {
    personalAccessToken = prompt(
      'Enter your GitHub Personal Access Token (PAT)'
    );
  } while (personalAccessToken === null || personalAccessToken === '');

  return personalAccessToken;
}

function loadPersonalAccessToken(): string | null {
  return localStorage.getItem(personalAccessTokenStorageKey);
}

function storePersonalAccessToken(personalAccessToken: string): void {
  localStorage.setItem(personalAccessTokenStorageKey, personalAccessToken);
}

const personalAccessTokenStorageKey = 'Gitropolis.personalAccessToken';

export const githubAuthenticationToken = new InjectionToken<string>(
  'githubAuthenticationToken',
  {
    providedIn: 'root',
    factory: (): string => {
      let personalAccessToken: string | null = loadPersonalAccessToken();

      if (personalAccessToken === null) {
        personalAccessToken = askUserForPersonalAccessToken();
        storePersonalAccessToken(personalAccessToken);
      }

      return personalAccessToken;
    },
  }
);
