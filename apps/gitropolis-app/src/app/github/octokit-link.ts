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

export abstract class OctokitLinks {
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

    return {
      firstUrl: links.find(hasRel('first'))?.url,
      lastUrl: links.find(hasRel('last'))?.url,
      nextUrl: links.find(hasRel('next'))?.url,
      previousUrl: links.find(hasRel('prev'))?.url,
    };
  }

  abstract readonly firstUrl?: URL;
  abstract readonly lastUrl?: URL;
  abstract readonly nextUrl?: URL;
  abstract readonly previousUrl?: URL;
}
