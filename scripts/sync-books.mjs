// Saves the Goodreads "read" shelf to src/data/books.json for the /books/ page.
// Run with `npm run books` after updating Goodreads. Goodreads blocks requests
// from Cloudflare's build servers, so the site builds from this saved file.
import { mkdir, writeFile } from "node:fs/promises";

const GOODREADS_USER_ID = "19254729";
const OUTPUT = new URL("../src/data/books.json", import.meta.url);

function tag(item, name) {
  const value = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1] ?? "";
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

const books = [];
for (let page = 1; page <= 50; page++) {
  const response = await fetch(
    // Goodreads serves stale copies of larger feed pages, so read small pages with a unique `t`.
    `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=read&per_page=30&page=${page}&t=${Date.now()}`
  );
  if (!response.ok) throw new Error(`Goodreads returned ${response.status}`);

  const items = [...(await response.text()).matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  for (const item of items) {
    const id = tag(item, "book_id");
    const title = tag(item, "title");
    if (!id || !title) continue;
    const cover = tag(item, "book_large_image_url");
    books.push({
      id,
      title,
      // Series and subtitles are dropped for the printed fallback cover.
      shortTitle: title.replace(/\s*\([^)]*#[^)]*\)\s*$/, "").replace(/:.*$/, "").trim(),
      author: tag(item, "author_name").replace(/\s+/g, " "),
      cover: cover.includes("nophoto") ? "" : cover,
      url: `https://www.goodreads.com/book/show/${id}`,
      readAt: Date.parse(tag(item, "user_read_at") || tag(item, "user_date_added")) || 0,
    });
  }
  if (items.length === 0) break;
}

const seen = new Set();
const shelf = books
  .sort((a, b) => b.readAt - a.readAt)
  .filter((book) => !seen.has(book.id) && seen.add(book.id))
  .map(({ readAt, ...book }) => book);

if (shelf.length === 0) throw new Error("Goodreads returned no books, so books.json was left unchanged.");

await mkdir(new URL(".", OUTPUT), { recursive: true });
await writeFile(OUTPUT, JSON.stringify(shelf, null, 2) + "\n");
console.log(`Saved ${shelf.length} books to src/data/books.json`);
