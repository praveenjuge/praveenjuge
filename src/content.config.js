import { defineCollection } from "astro:content";
import { readdir } from "node:fs/promises";
import { basename, extname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "astro/loaders";
import { rssSchema } from "@astrojs/rss";

const blog = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/blog" }),
  schema: rssSchema,
});

const DESIGN_DIRECTORY = "src/content/design";
const DESIGN_IMAGE_PATTERN = /\.(avif|jpe?g|png|webp)$/i;

const MONTH_INDEX_BY_TOKEN = new Map([
  ["jan", 0],
  ["feb", 1],
  ["mar", 2],
  ["apr", 3],
  ["may", 4],
  ["jun", 5],
  ["june", 5],
  ["jul", 6],
  ["july", 6],
  ["aug", 7],
  ["sep", 8],
  ["oct", 9],
  ["nov", 10],
  ["dec", 11],
]);

function toSiteRelativePath(rootPath, filePath) {
  return relative(rootPath, filePath).split(sep).join("/");
}

function isDesignImageFile(fileName) {
  return DESIGN_IMAGE_PATTERN.test(fileName);
}

function isDesignImagePath(rootPath, filePath) {
  const relativePath = toSiteRelativePath(rootPath, filePath);
  return (
    relativePath.startsWith(`${DESIGN_DIRECTORY}/`) &&
    isDesignImageFile(filePath)
  );
}

function parseDesignPubDate(id) {
  const match = /^(?<year>\d{4})-(?<month>[a-z]+)-(?<day>\d{1,2})$/i.exec(id);

  if (!match?.groups) {
    throw new Error(
      `Invalid design filename "${id}". Expected format: YYYY-month-D or YYYY-month-DD.`
    );
  }

  const { year: yearValue, month: monthValue, day: dayValue } = match.groups;

  if (!yearValue || !monthValue || !dayValue) {
    throw new Error(`Incomplete date groups in design filename "${id}".`);
  }

  const year = Number(yearValue);
  const day = Number(dayValue);
  const monthToken = monthValue.toLowerCase();
  const monthIndex = MONTH_INDEX_BY_TOKEN.get(monthToken);

  if (monthIndex === undefined) {
    throw new Error(
      `Invalid month token "${monthToken}" in design filename "${id}".`
    );
  }

  const pubDate = new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));

  if (
    Number.isNaN(pubDate.valueOf()) ||
    pubDate.getUTCFullYear() !== year ||
    pubDate.getUTCMonth() !== monthIndex ||
    pubDate.getUTCDate() !== day
  ) {
    throw new Error(`Invalid calendar date in design filename "${id}".`);
  }

  return pubDate;
}

async function listDesignImageEntries(rootPath) {
  const designDirectory = join(rootPath, DESIGN_DIRECTORY);
  const dirents = await readdir(designDirectory, { withFileTypes: true });
  const ids = new Set();

  return dirents
    .filter((dirent) => dirent.isFile() && isDesignImageFile(dirent.name))
    .map((dirent) => {
      const cover = dirent.name;
      const id = basename(cover, extname(cover));

      if (ids.has(id)) {
        throw new Error(`Duplicate design entry id "${id}" found.`);
      }

      ids.add(id);

      const absoluteFilePath = join(designDirectory, cover);

      return {
        id,
        title: id,
        cover,
        pubDate: parseDesignPubDate(id),
        absoluteFilePath,
        relativeFilePath: toSiteRelativePath(rootPath, absoluteFilePath),
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

const designLoader = {
  name: "local-design-image-loader",
  load: async ({ config, generateDigest, logger, meta, parseData, store, watcher }) => {
    const rootPath = fileURLToPath(config.root);

    const syncDesignEntries = async () => {
      const entries = await listDesignImageEntries(rootPath);

      store.clear();

      for (const entry of entries) {
        const data = await parseData({
          id: entry.id,
          data: {
            title: entry.title,
            cover: entry.cover,
            pubDate: entry.pubDate,
          },
          filePath: entry.absoluteFilePath,
        });

        store.set({
          id: entry.id,
          data,
          digest: generateDigest(
            `${entry.id}:${entry.cover}:${entry.pubDate.toISOString()}`
          ),
          filePath: entry.relativeFilePath,
        });
      }
    };

    await syncDesignEntries();

    if (!watcher || meta.get("watching") === "true") {
      return;
    }

    meta.set("watching", "true");
    watcher.add(fileURLToPath(new URL(DESIGN_DIRECTORY, config.root)));

    const reloadDesignEntries = async (filePath) => {
      if (!isDesignImagePath(rootPath, filePath)) {
        return;
      }

      await syncDesignEntries();
      logger.info(`Reloaded data from ${filePath}`);
    };

    watcher.on("add", reloadDesignEntries);
    watcher.on("change", reloadDesignEntries);
    watcher.on("unlink", reloadDesignEntries);
  },
};

const design = defineCollection({
  loader: designLoader,
  schema: ({ image }) => rssSchema.extend({ cover: image() }),
});

export const collections = { blog, design };