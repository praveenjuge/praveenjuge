import { readFileSync } from "node:fs";

const source = [
  readFileSync("src/Layout.astro", "utf8"),
  readFileSync("src/pages/index.astro", "utf8"),
].join("\n");
const errors = [];

const inlineSvgBytes = [...source.matchAll(/<svg[\s\S]*?<\/svg\s*>/g)].reduce(
  (total, match) => total + Buffer.byteLength(match[0], "utf8"),
  0
);

if (inlineSvgBytes > 1024) {
  errors.push(
    `Homepage templates contain ${inlineSvgBytes} bytes of inline SVG; keep decorative icons in public assets so raw HTML stays content-focused.`
  );
}

const SRC = /\ssrc=(["'])(.*?)\1/;
const ALT = /\salt=(["'])(.*?)\1/;
const CLASS = /\sclass=(["'])(.*?)\1/;
const attr = (tag, pattern) => tag.match(pattern)?.[2];
const decorative = ["/icons/arrow-up-right.svg"];

for (const [tag] of source.matchAll(/<img\b[\s\S]*?>/g)) {
  const src = attr(tag, SRC);
  if (!src || !/^\/(wordmark|icons\/[\w-]+)\.svg$/.test(src)) continue;

  if (!(attr(tag, CLASS) ?? "").split(/\s+/).includes("bg-transparent!")) {
    errors.push(`${src} needs bg-transparent! so the global [&_img]:bg-gray-100 placeholder doesn't paint behind it.`);
  }
  if (!decorative.includes(src) && !attr(tag, ALT)?.trim()) {
    errors.push(`${src} needs non-empty alt text; it is the only label for its link.`);
  }
}

if (errors.length) {
  throw new Error(errors.join("\n"));
}

console.log(`Homepage inline SVG: ${inlineSvgBytes} bytes; icon images OK`);
