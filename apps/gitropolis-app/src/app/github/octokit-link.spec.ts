import { OctokitLinks } from './octokit-link';

describe('OctokitLinks', () => {
  it(`
  Given the first page of authenticated repositories is listed
  Then the "Link" header is transformed`, () => {
    const linkHeader =
      '<https://api.github.com/user/repos?page=2&per_page=100>; rel="next", <https://api.github.com/user/repos?page=3&per_page=100>; rel="last"';

    const actualLinks = OctokitLinks.fromLinkHeader(linkHeader);

    const expectedLinks: Partial<OctokitLinks> = {
      lastUrl: new URL('https://api.github.com/user/repos?page=3&per_page=100'),
      nextUrl: new URL('https://api.github.com/user/repos?page=2&per_page=100'),
    };
    expect(actualLinks).toEqual(expectedLinks);
    expect(actualLinks.lastPageNumber).toBe(3);
    expect(actualLinks.nextPageNumber).toBe(2);
    expect(actualLinks.isLastPage).toBe(false);
  });

  it(`
  Given the second page of authenticated repositories is listed
  Then the "Link" header is transformed`, () => {
    const linkHeader =
      '<https://api.github.com/user/repos?page=1&per_page=100>; rel="prev", <https://api.github.com/user/repos?page=3&per_page=100>; rel="next", <https://api.github.com/user/repos?page=3&per_page=100>; rel="last", <https://api.github.com/user/repos?page=1&per_page=100>; rel="first"';

    const actualLinks = OctokitLinks.fromLinkHeader(linkHeader);

    const expectedLinks: Partial<OctokitLinks> = {
      firstUrl: new URL(
        'https://api.github.com/user/repos?page=1&per_page=100'
      ),
      lastUrl: new URL('https://api.github.com/user/repos?page=3&per_page=100'),
      nextUrl: new URL('https://api.github.com/user/repos?page=3&per_page=100'),
      previousUrl: new URL(
        'https://api.github.com/user/repos?page=1&per_page=100'
      ),
    };
    expect(actualLinks).toEqual(expectedLinks);
    expect(actualLinks.firstPageNumber).toBe(1);
    expect(actualLinks.lastPageNumber).toBe(3);
    expect(actualLinks.nextPageNumber).toBe(3);
    expect(actualLinks.previousPageNumber).toBe(1);
    expect(actualLinks.isLastPage).toBe(false);
  });

  it(`
  Given the last page of authenticated repositories is listed
  Then the "Link" header is transformed`, () => {
    const linkHeader =
      '<https://api.github.com/user/repos?page=2&per_page=100>; rel="prev", <https://api.github.com/user/repos?page=1&per_page=100>; rel="first"';

    const actualLinks = OctokitLinks.fromLinkHeader(linkHeader);

    const expectedLinks: Partial<OctokitLinks> = {
      firstUrl: new URL(
        'https://api.github.com/user/repos?page=1&per_page=100'
      ),
      previousUrl: new URL(
        'https://api.github.com/user/repos?page=2&per_page=100'
      ),
    };
    expect(actualLinks).toEqual(expectedLinks);
    expect(actualLinks.firstPageNumber).toBe(1);
    expect(actualLinks.previousPageNumber).toBe(2);
    expect(actualLinks.isLastPage).toBe(true);
  });
});
