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
ng generate @schematics/angular:module --name=repositories
ng generate @angular/material:table --name=repositories --changeDetection=OnPush --skipTests
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
