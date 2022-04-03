import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ForModule } from '@rx-angular/template/experimental/for';
import { PushModule } from '@rx-angular/template/push';

import { RepositoriesStore } from './repositories.store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'gitropolis-repositories',
  styleUrls: ['./repositories.component.css'],
  templateUrl: './repositories.component.html',
  viewProviders: [RepositoriesStore],
})
export class RepositoriesComponent {
  repositories$ = this.store.authenticatedRepositories$;

  constructor(private store: RepositoriesStore) {}
}

@NgModule({
  declarations: [RepositoriesComponent],
  exports: [RepositoriesComponent],
  imports: [ForModule, MatIconModule, MatListModule, PushModule],
})
export class RepositoriesScam {}
