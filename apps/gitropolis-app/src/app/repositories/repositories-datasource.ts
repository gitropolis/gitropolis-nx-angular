import { DataSource } from '@angular/cdk/collections';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { RepositoriesStore } from './repositories.store';
import { Repositories, Repository } from './repository';

/**
 * Data source for the Repositories view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
@Injectable()
export class RepositoriesDataSource extends DataSource<Repository> {
  constructor(private store: RepositoriesStore) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Repositories> {
    return this.store.authenticatedRepositories$;
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect(): void {
    // No cleanup needed for now. Subscription to the observable returned in
    // `connect` is assumed managed by Angular Material.
  }
}
