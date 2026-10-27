const designDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** A readable name for a daily design, like "Design from Oct 10, 2026". */
export const designLabel = (design) =>
  `Design from ${designDate.format(design.data.pubDate)}`;

// The archive opens with 36 designs and continues in pages of 96. Both are
// multiples of 6, so every page fills complete rows in the 1, 2 and 3 column
// grids.
const FIRST_PAGE_SIZE = 36;
const PAGE_SIZE = 96;

/** Splits newest-first designs into archive pages. */
export const designPages = (designs) => {
  const pages = [designs.slice(0, FIRST_PAGE_SIZE)];
  for (let start = FIRST_PAGE_SIZE; start < designs.length; start += PAGE_SIZE) {
    pages.push(designs.slice(start, start + PAGE_SIZE));
  }
  return pages;
};

/** The URL of a 1-based archive page. */
export const designPageHref = (page) =>
  page === 1 ? "/design/" : `/design/page/${page}/`;
