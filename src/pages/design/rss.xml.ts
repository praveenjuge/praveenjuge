import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import {
  SITE_DESCRIPTION,
  AUTHOR_NAME,
  AUTHOR_URL,
  AUTHOR_EMAIL,
} from "../../consts";

export const GET: APIRoute = async () => {
  const postImportResult = import.meta.glob("../../content/design/**/*.md", {
    eager: true,
  });
  const posts = Object.values(postImportResult);
  const sortedPosts = [...posts].sort((a: any, b: any) => {
    return (
      new Date(b.frontmatter.pubDate).getTime() -
      new Date(a.frontmatter.pubDate).getTime()
    );
  });

  return rss({
    title: AUTHOR_NAME,
    description: SITE_DESCRIPTION,
    site: AUTHOR_URL,
    trailingSlash: false,
    items: await Promise.all(
      sortedPosts.map(async (post: any) => {
        return {
          title: post.frontmatter.title,
          pubDate: post.frontmatter.pubDate,
          author: AUTHOR_EMAIL,
          link: `/design/${post.file.split("/").pop()?.split(".")[0]}`,
        };
      })
    ),
    customData: [
      "<category>Design</category>",
      "<category>Technology</category>",
      `<language>en-us</language>`,
      `<copyright>Copyright ${AUTHOR_NAME}</copyright>`,
    ].join(""),
  });
};
