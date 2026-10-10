const designDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** A readable name for a daily design, like "Design from Oct 10, 2026". */
export const designLabel = (design) =>
  `Design from ${designDate.format(design.data.pubDate)}`;
