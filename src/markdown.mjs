// Sätteri HTML-tree plugins for blog posts. They run after
// `satteriHeadingIdsPlugin()` in astro.config.mjs, so headings already have ids.

const isWhitespace = (node) =>
  node.type === "text" && node.value.trim() === "";

/** Give every h2 and h3 a hover link to itself, for sharing a section. */
export const headingAnchors = {
  name: "heading-anchors",
  element: {
    filter: ["h2", "h3"],
    visit(node, ctx) {
      const id = node.properties?.id;
      if (typeof id !== "string") return;
      // Empty on purpose: the "#" comes from CSS, so it stays out of the
      // heading's text in feeds, search snippets and the outline.
      ctx.appendChild(node, {
        type: "element",
        tagName: "a",
        properties: {
          href: `#${id}`,
          className: ["heading-anchor"],
          ariaLabel: "Link to this section",
        },
        children: [],
      });
    },
  },
};

/** Turn `![alt](src "Caption")` on its own line into a figure with a caption. */
export const imageCaptions = {
  name: "image-captions",
  element: {
    filter: ["p"],
    visit(node, ctx) {
      const content = node.children.filter((child) => !isWhitespace(child));
      const [image] = content;
      if (content.length !== 1 || image.tagName !== "img") return;
      const caption = image.properties?.title;
      if (typeof caption !== "string" || caption.trim() === "") return;
      ctx.wrapNode(node, {
        type: "element",
        tagName: "figure",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: caption }],
          },
        ],
      });
    },
  },
};
