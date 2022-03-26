import { Component, NgModule } from '@angular/core';

import { RepositoriesScam } from './repositories/repositories.component';

@Component({
  selector: 'gitropolis-app',
  template: `<gitropolis-repositories></gitropolis-repositories>`,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class AppComponent {}

@NgModule({
  declarations: [AppComponent],
  imports: [RepositoriesScam],
})
export class AppScam {}
