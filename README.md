# Nx Angular Gitropolis

```powershell
yarn create nx-workspace nx-angular-gitropolis --package-manager=yarn --preset=angular --app-name=gitropolis-app --npm-scope=gitropolis --style=css --no-nx-cloud
```

```powershell
yarn add @angular/material
nx generate @angular/material:ng-add --theme=purple-green --typography --animations
```

Clean up AppComponent:

1. Remove NxWelcomeComponent.
1. Delete app.component.spec.ts.
1. Remove BrowserModule from AppComponent.imports.

Generate Angular Material table component

```powershell
ng generate @schematics/angular:module repositories
ng generate @angular/material:table repositories --changeDetection=OnPush --skip-tests
```

Add Octokit REST:

```powershell
yarn add @octokit/rest
```

```ts
import { InjectionToken } from '@angular/core';
import { Octokit } from '@octokit/rest';

export const octokitToken = new InjectionToken<Octokit>('octokitToken', {
  providedIn: 'root',
  factory: () =>
    new Octokit({
      auth: prompt('Enter your GitHub Personal Access Token (PAT)'),
    }),
});
```

<figcaption>octokit.token.ts</figcaption>

Add NgRx ComponentStore:

```powershell
yarn add @ngrx/component-store
```

```ts
import { Inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Octokit } from '@octokit/rest';
import { defer } from 'rxjs';

import { octokitToken } from '../octokit.token';

interface RepositoriesState {}

@Injectable()
export class RepositoriesStore extends ComponentStore<RepositoriesState> {
  authenticatedRepositories$ = this.select(
    defer(() => this.octokit.rest.repos.listForAuthenticatedUser()),
    (response) => response.data
  );

  constructor(@Inject(octokitToken) private octokit: Octokit) {
    super(initialState);
  }
}

const initialState: RepositoriesState = {};
```

<figcaption>repositories.store.ts</figcaption>
