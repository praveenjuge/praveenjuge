import rss from "@astrojs/rss";
import {
  SITE_DESCRIPTION,
  AUTHOR_NAME,
  AUTHOR_URL,
  AUTHOR_EMAIL,
} from "../../consts";
import { getCollection } from "astro:content";

export const GET = async () => {
  const designs = (await getCollection("design")).sort(
    (a, b) =>
      (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0)
  );
  return rss({
    title: AUTHOR_NAME,
    description: SITE_DESCRIPTION,
    site: AUTHOR_URL,
    items: designs.map((design) => {
      return {
        title: design.id,
        pubDate: design.data.pubDate,
        author: `${AUTHOR_NAME} (${AUTHOR_EMAIL})`,
        link: `/design/${design.id}`,
      };
    }),
    customData: [
      "<category>Design</category>",
      "<category>Technology</category>",
      `<language>en-us</language>`,
      `<copyright>Copyright ${AUTHOR_NAME}</copyright>`,
    ].join(""),
  });
};