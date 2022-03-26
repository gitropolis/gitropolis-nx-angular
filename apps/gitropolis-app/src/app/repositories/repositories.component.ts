import { AfterViewInit, ChangeDetectionStrategy, Component, NgModule, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableModule } from '@angular/material/table';

import { RepositoriesDataSource } from './repositories-datasource';
import { RepositoriesStore } from './repositories.store';
import { Repository } from './repository';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'gitropolis-repositories',
  styleUrls: ['./repositories.component.css'],
  templateUrl: './repositories.component.html',
  viewProviders: [RepositoriesDataSource, RepositoriesStore],
})
export class RepositoriesComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;
  @ViewChild(MatTable) table?: MatTable<Repository>;
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns: Array<keyof Repository> = [
    'fullName',
    'description',
    'url',
  ];

  constructor(
    public dataSource: RepositoriesDataSource,
    private store: RepositoriesStore
  ) {}

  ngAfterViewInit(): void {
    if (this.sort !== undefined) {
      this.store.onSort(this.sort);
    }

    if (this.paginator !== undefined) {
      this.store.onPaginate(this.paginator);
    }

    if (this.table !== undefined) {
      this.table.dataSource = this.dataSource;
    }
  }
}

@NgModule({
  declarations: [RepositoriesComponent],
  exports: [RepositoriesComponent],
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
})
export class RepositoriesScam {}
