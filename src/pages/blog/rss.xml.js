import rss from "@astrojs/rss";
import {
  SITE_DESCRIPTION,
  AUTHOR_NAME,
  AUTHOR_URL,
  AUTHOR_EMAIL,
} from "../../consts";

export const GET = async () => {
  const postImportResult = import.meta.glob("../../content/blog/**/*.md", {
    eager: true,
  });
  const posts = Object.values(postImportResult);
  const sortedPosts = [...posts].sort((a, b) => {
    return (
      new Date(b.frontmatter.pubDate).getTime() -
      new Date(a.frontmatter.pubDate).getTime()
    );
  });

  return rss({
    title: AUTHOR_NAME,
    description: SITE_DESCRIPTION,
    site: AUTHOR_URL,
    items: await Promise.all(
      sortedPosts.map(async (post) => {
        return {
          title: post.frontmatter.title,
          description: post.frontmatter.description,
          pubDate: post.frontmatter.pubDate,
          author: `${AUTHOR_NAME} (${AUTHOR_EMAIL})`,
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