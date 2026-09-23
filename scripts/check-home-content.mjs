import { readFileSync } from "node:fs";

const files = ["src/Layout.astro", "src/pages/index.astro"];
const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
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

const attr = (tag, name) =>
  tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const labeled = ["/wordmark.svg", "/icons/github.svg", "/icons/dribbble.svg", "/icons/x.svg", "/icons/mark.svg"];

for (const [tag] of source.matchAll(/<img\b[\s\S]*?>/g)) {
  const src = attr(tag, "src");
  if (!src || !/^\/(wordmark|icons\/[\w-]+)\.svg$/.test(src)) continue;

  if (!(attr(tag, "class") ?? "").split(/\s+/).includes("bg-transparent!")) {
    errors.push(`${src} needs bg-transparent! so the global [&_img]:bg-gray-100 placeholder doesn't paint behind it.`);
  }
  if (labeled.includes(src) && !attr(tag, "alt")?.trim()) {
    errors.push(`${src} needs non-empty alt text; it is the only label for its link.`);
  }
}

if (errors.length) {
  throw new Error(errors.join("\n"));
}

console.log(`Homepage inline SVG: ${inlineSvgBytes} bytes; icon images OK`);
