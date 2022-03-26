export interface Repository {
  readonly description: string;
  readonly fullName: string;
  readonly url: string;
}

export type Repositories = readonly Repository[];
