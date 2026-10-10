import rss from "@astrojs/rss";
import { SITE, AUTHOR } from "../../consts";
import { getNewest } from "../../collections.js";

export const GET = async (context) => {
  const designs = await getNewest("design");

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
