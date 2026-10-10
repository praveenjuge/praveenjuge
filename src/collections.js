import { getCollection } from "astro:content";

/**
 * A collection's entries, newest first.
 * @template {"blog" | "design"} C
 * @param {C} collection
 */
export const getNewest = async (collection) =>
  (await getCollection(collection)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
