# Font subsetting

`subset.py` cuts Geist down to what the site draws with it and writes the
result to `src/fonts/`. It is not part of the build: run it by hand and
commit what it writes.

For each style (upright and italic) it writes two files:

- `geist-<style>-core.woff2`: ASCII plus ‘ ’ “ ” – — … · •. The layout
  preloads the upright one on every page.
- `geist-<style>-ext.woff2`: the rest of Latin-1 and Latin Extended-A. Its
  `unicode-range` lists only those characters, so a page downloads it only
  when it uses one.

`src/fonts/geist.json` lists the files and ranges for the font provider in
`astro.config.mjs`. `scripts/fonts/usage.json` records what the last crawl
found, so a rerun's diff shows what changed and why.

## Running it

```sh
python3 -m venv .venv && . .venv/bin/activate
pip install -r scripts/fonts/requirements.txt
python -m playwright install chromium

bun run build
python scripts/fonts/subset.py
bun run build   # picks up the new files
```

It crawls every page in `dist/`, downloads the pinned Geist sources (cached
in `scripts/fonts/.cache/`, checked against SHA-256 hashes), writes the
files, then checks each one: coverage, `unicode-range`, axes, features, no
hinting, unchanged metrics, and that HarfBuzz draws every crawled run exactly
as the source font does. It exits with an error if any check fails. With
nothing changed, a rerun writes byte-identical files.

## When to rerun

Rerun after adding content or CSS that uses Geist in a way `usage.json`
doesn't list. Until you do, the browser falls back or makes do:

- **A new weight or style pairing.** Upright keeps weights 400 to 900;
  anything lighter (`font-light`, `font-thin`) draws at 400. Italic is only
  used at 400, so it ships as a static 400 face: bold inside italics, or an
  italic heading, draws at 400 too.
- **A character Google's old subset had that isn't in Latin-1 or Latin
  Extended-A**, such as € ™ − ′ ″ ↑ ↓ ‹ › ‚ „. These were left out because no
  page uses them, so they draw in Arial until a rerun adds them.
- **A numeric or language feature**: `diagonal-fractions`,
  `proportional-nums`, `tabular-nums` in italic text, or a `lang` other than
  English (Turkish, Dutch and other spellings use `locl`).
- **A punctuation mark outside the core showing up on most pages.** Check
  `pagesPerCharacter` in `usage.json` and add it to `CORE` in `subset.py`.
- **Upgrading Geist.** Update `SOURCE_COMMIT` and the hashes.

## Keeping rendering unchanged

The site used to load Google's `latin` subset of Geist, and these files
draw exactly what it drew:

- Characters outside that subset (← → ‑, emoji, CJK) still come from the
  fallback or system fonts. To draw one in Geist instead, add it to
  `EXTRA_CHARACTERS`.
- Google strips the stylistic sets the site's CSS asks for (`ss02`, `ss03`,
  `ss09`), so they stay out. To turn them on, add them to `EXTRA_FEATURES`.
  That changes the a, e and g on every page.
- The weight axis drops whole sides of the default (400) and keeps the other
  side's full extent. Narrowing it further, or pinning a weight other than
  400, makes fontTools round the outline deltas, which moved points by up to
  a font unit.
- The `@font-face` weight stays `100 900` as before, and the italic files are
  listed first as Google did, so the fallback faces Astro generates stay
  byte-identical.

Text that mixes core and extended characters is shaped in separate runs, so
there's no kerning between, say, `T` and `é`. No page has accented text
today. Moving all of Latin-1 into the core avoids that, but adds about 5 KB
to the preloaded file.

Geist's licence (`src/fonts/OFL.txt`) declares no Reserved Font Name, so the
subsets keep the name Geist. The script stops if a source ever declares one.
