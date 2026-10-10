import { AUTHOR } from "../consts";

// The Worker serves this file for missing pages when a client asks for Markdown.
export const GET = ({ site }) => {
  const url = (path) => new URL(path, site).href;

  return new Response(`# Page not found (404)

The requested page does not exist on ${AUTHOR.name}'s website. It may have moved,
or the address may be incorrect. Use these links to find an existing page:

- [Home](${url("/")})
- [Blog](${url("/blog/")})
- [Site guide](${url("/llms.txt")})
- [Sitemap](${url("/sitemap-index.xml")})
`);
};
