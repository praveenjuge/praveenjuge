import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE, AUTHOR } from "../../consts";

export const GET = async (context) => {
  const designs = (await getCollection("design")).sort(
    (a, b) =>
      (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0),
  );

  return rss({
    title: AUTHOR.name,
    description: SITE.description,
    site: context.site,
    items: designs.map((design) => ({
      title: design.id,
      pubDate: design.data.pubDate,
      author: `${AUTHOR.name} (${AUTHOR.email})`,
      link: `/design/${design.id}`,
    })),
    customData: `<category>Design</category><category>Technology</category><language>en-us</language><copyright>Copyright ${AUTHOR.name}</copyright>`,
  });
};
