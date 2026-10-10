import rss from "@astrojs/rss";
import { SITE, AUTHOR } from "../../consts";
import { getNewest } from "../../collections.js";

export const GET = async (context) => {
  const posts = await getNewest("blog");

  return rss({
    title: AUTHOR.name,
    description: SITE.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      author: `${AUTHOR.name} (${AUTHOR.email})`,
      link: `/blog/${post.id}/`,
    })),
    customData: `<category>Design</category><category>Technology</category><language>en-us</language><copyright>Copyright ${AUTHOR.name}</copyright>`,
  });
};
