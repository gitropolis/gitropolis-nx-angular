interface LinkPatternNamedGroups {
  readonly rel: OctokitLinkRel;
  readonly url: string;
}
interface OctokitLink {
  readonly rel: OctokitLinkRel;
  readonly url: URL;
}

type OctokitLinkRel = 'first' | 'last' | 'next' | 'prev';

const hasRel = (rel: OctokitLinkRel) => (link: OctokitLink) => link.rel === rel;

export class OctokitLinks {
  readonly firstUrl?: URL;
  get firstPageNumber(): number | null {
    return this.firstUrl ? this.#pageNumber(this.firstUrl) : null;
  }
  readonly lastUrl?: URL;
  get lastPageNumber(): number | null {
    return this.lastUrl ? this.#pageNumber(this.lastUrl) : null;
  }
  readonly nextUrl?: URL;
  get nextPageNumber(): number | null {
    return this.nextUrl ? this.#pageNumber(this.nextUrl) : null;
  }
  readonly previousUrl?: URL;
  get previousPageNumber(): number | null {
    return this.previousUrl ? this.#pageNumber(this.previousUrl) : null;
  }

  static fromLinkHeader(linkHeader: string): OctokitLinks {
    const linkPattern = /^<(?<url>.*)>; rel="(?<rel>\w+)"$/;

    const links: readonly OctokitLink[] = linkHeader
      .split(',')
      .map((linkPart) => linkPart.trim())
      .map((linkPart): LinkPatternNamedGroups => {
        const namedGroups: LinkPatternNamedGroups | undefined =
          linkPattern.exec(linkPart)?.groups as
            | LinkPatternNamedGroups
            | undefined;

        if (namedGroups === undefined) {
          throw new Error(
            `The "Link" header "${linkHeader}" did not match the expected pattern.`
          );
        }

        return namedGroups;
      })
      .map(({ rel, url }) => ({
        rel,
        url: new URL(url),
      }));

    return new OctokitLinks({
      firstUrl: links.find(hasRel('first'))?.url,
      lastUrl: links.find(hasRel('last'))?.url,
      nextUrl: links.find(hasRel('next'))?.url,
      previousUrl: links.find(hasRel('prev'))?.url,
    });
  }

  private constructor(properties: Partial<OctokitLinks>) {
    ({
      firstUrl: this.firstUrl,
      lastUrl: this.lastUrl,
      nextUrl: this.nextUrl,
      previousUrl: this.previousUrl,
    } = properties);
  }

  #pageNumber(url: URL): number | null {
    const pageNumber = Number.parseInt(url.searchParams.get('page') ?? '', 10);

    return Number.isNaN(pageNumber) ? null : pageNumber;
  }
}
