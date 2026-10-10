import { AUTHOR } from "../consts";

// The Worker also serves this file as the Markdown version of the homepage.
export const GET = ({ site }) => {
  const url = (path) => new URL(path, site).href;

  return new Response(`# ${AUTHOR.name}

> ${AUTHOR.name} is a designer and developer specializing in UI design,
> accessibility, CSS, and design systems. This is his personal website with
> his projects, writing, and design archive.

## When to use this site

- To learn who ${AUTHOR.name} is, what he works on, or how to contact him.
- To find his open-source projects: MynaUI (UI kit), MynaUI Icons, Vadivam
  (icons), Niram (shadcn/ui design system generator), Teak (knowledge hub),
  One Hour (habit tracker), Mosaic (OG images), and Copy Book (common texts).
- To read his writing on design, side projects, and developer tools.
- To browse his design archive and free Figma community resources.

## Site map

- [Home](${url("/")}): overview and featured projects
- [Blog](${url("/blog/")}): essays and build notes
- [Designs](${url("/design/")}): design archive
- [Links](${url("/links/")}): all social profiles
- [Sitemap](${url("/sitemap-index.xml")}): every page
- [Blog RSS](${url("/blog/rss.xml")})
- [Design RSS](${url("/design/rss.xml")})

## Contact

Email ${AUTHOR.email}. Social profiles are listed at
${url("/links/")}.
`);
};
