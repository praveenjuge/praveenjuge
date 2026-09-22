import { readFileSync } from "node:fs";

const files = ["src/Layout.astro", "src/pages/index.astro"];
const source = files.map((file) => readFileSync(file, "utf8")).join("\n");
const inlineSvgBytes = [...source.matchAll(/<svg[\s\S]*?<\/svg\s*>/g)].reduce(
  (total, match) => total + match[0].length,
  0
);

if (inlineSvgBytes > 1024) {
  throw new Error(
    `Homepage templates contain ${inlineSvgBytes} bytes of inline SVG; keep decorative icons in public assets so raw HTML stays content-focused.`
  );
}

console.log(`Homepage inline SVG: ${inlineSvgBytes} bytes`);
