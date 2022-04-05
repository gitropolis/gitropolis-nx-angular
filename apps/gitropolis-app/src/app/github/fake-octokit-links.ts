import { OctokitLinks } from './octokit-links';

export interface FakeOctokitLinksOptions {
  readonly endpointPath: string;
  readonly numberOfPages: number;
  readonly pageNumber: number;
  readonly pageSize: number;
}

export class FakeOctokitLinks extends OctokitLinks {
  static from({
    endpointPath,
    numberOfPages,
    pageNumber,
    pageSize,
  }: FakeOctokitLinksOptions): OctokitLinks {
    if (pageNumber < 1) {
      throw new Error(
        `The "pageNumber":${pageNumber} argument must be greater than or equal to 1.`
      );
    }

    if (numberOfPages < 1) {
      throw new Error(
        `The "numberOfPages":${numberOfPages} argument must be greater than or equal to 1.`
      );
    }

    if (pageNumber > numberOfPages) {
      throw new Error(
        `"pageNumber":${pageNumber} must be less than or equal to "pageSize":${pageSize}.`
      );
    }

    if (pageSize < 1) {
      throw new Error(
        `The "pageSize":${pageSize} argument must be greater than or equal to 1.`
      );
    }

    if (endpointPath === '') {
      throw new Error(
        `The "endpointPath":"${endpointPath}" argument must not be an empty string.`
      );
    }

    const endpointBase = 'https://api.github.com/';
    const createUrl = (page: number) =>
      new URL(
        `${endpointPath}?${new URLSearchParams({
          page: String(page),
          per_page: String(pageSize),
        })}`,
        endpointBase
      );

    return new OctokitLinks({
      firstUrl: pageNumber === 1 ? undefined : createUrl(1),
      lastUrl:
        pageNumber === numberOfPages ? undefined : createUrl(numberOfPages),
      nextUrl:
        pageNumber < numberOfPages ? createUrl(pageNumber + 1) : undefined,
      previousUrl: pageNumber > 1 ? createUrl(pageNumber - 1) : undefined,
    });
  }
}
