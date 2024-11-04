import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import {
  SITE_DESCRIPTION,
  AUTHOR_NAME,
  AUTHOR_URL,
  AUTHOR_EMAIL,
} from "../../consts";

export const GET: APIRoute = async () => {
  const postImportResult = import.meta.glob("../../content/blog/**/*.md", {
    eager: true,
  });
  const posts = Object.values(postImportResult);

  // Sort posts by date in descending order (newest first)
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
          description: post.frontmatter.description,
          pubDate: post.frontmatter.pubDate,
          author: AUTHOR_EMAIL,
          link: `/blog/${post.file.split("/").pop()?.split(".")[0]}`,
          content:
            post.frontmatter.description + (await post.compiledContent()),
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
