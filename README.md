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
