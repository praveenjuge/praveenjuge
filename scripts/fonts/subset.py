#!/usr/bin/env python3
"""Cut Geist down to what this site draws with it, without changing a pixel.

Run by hand after `bun run build`; see scripts/fonts/README.md for when. It:

1. Crawls every page in dist/ with Chromium and records, for text set in
   Geist, which characters appear, at which weights and styles, and which
   OpenType features the CSS turns on.
2. Downloads the pinned Geist source fonts and checks their hashes.
3. Writes two files per style to src/fonts/: a small core (ASCII and the
   punctuation most pages use) that the layout preloads, and an extended file
   that a page only downloads when it needs one of its characters.
4. Checks the output: character coverage, unicode-range, axes, features,
   hinting, metrics, and that HarfBuzz shapes and draws every crawled run
   exactly as the source font does.

What "without changing a pixel" means here: the site used to load Google's
`latin` subset of Geist. Characters outside that subset were drawn by the
fallback font, and Google strips the stylistic sets the site's CSS asks for
(ss02, ss03, ss09). Both stay that way unless listed in EXTRA_CHARACTERS or
EXTRA_FEATURES below.
"""

import argparse
import asyncio
import functools
import hashlib
import http.server
import io
import json
import re
import sys
import threading
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / "src" / "fonts"
CACHE = HERE / ".cache"
FAMILY = "Geist"

# google/fonts at a fixed commit; the hashes catch any change upstream.
SOURCE_COMMIT = "6157dfaa640ca5738b4d1a7070fe389c3036d7fc"
SOURCE_BASE = f"https://raw.githubusercontent.com/google/fonts/{SOURCE_COMMIT}/ofl/geist/"
SOURCES = {
    "normal": ("Geist%5Bwght%5D.ttf", "73894e0448cae90a92b6c2f8732b7bb9acb7b94c418bff559dad4a18e1de9659"),
    "italic": ("Geist-Italic%5Bwght%5D.ttf", "a464348abe41a6392f18d04c0ac2ad3c26619357ff5fdd76aff3059116f45e62"),
}
LICENSE = ("OFL.txt", "1781d2806a07d91c4edf4740b88449fab7d0eadad53f7c351b94cd4d4eb8c00f")

# What Google's `latin` subset of Geist 1.800 drew: its cmap within its
# unicode-range. Anything else fell back to Arial or a system font.
GOOGLE_LATIN = (
    "U+0020-007E,U+00A0-00AC,U+00AE-00FF,U+0131,U+0152-0153,U+02BC,U+02C6,"
    "U+02DA,U+02DC,U+0304,U+0308,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,"
    "U+2026,U+2032-2033,U+2039-203A,U+2044,U+20AC,U+2122,U+2191,U+2193,U+2212"
)
# Features Google's subset kept. The source also has ss01-ss11, case, sups,
# subs, ordn, sinf, dlig and aalt; turning those on would restyle text.
GOOGLE_FEATURES = {"ccmp", "dnom", "frac", "liga", "locl", "numr", "pnum", "tnum", "kern", "mark", "mkmk"}
# Features browsers apply without being asked.
DEFAULT_FEATURES = {"ccmp", "liga", "kern", "mark", "mkmk"}

# Opt-ins that change rendering. Characters here are drawn in Geist instead
# of the fallback (for example "←→" from the design and blog pages); features
# here are kept if the CSS asks for them (for example "ss02", "ss03", "ss09").
EXTRA_CHARACTERS = ""
EXTRA_FEATURES = set()

# Always kept so new posts can use them without a rerun: printable Latin-1
# and Latin Extended-A.
ALWAYS = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100)) | set(range(0x100, 0x180))
# The core: ASCII plus the punctuation most pages use. The middle dot is in
# every post's byline and the bullet in their lists.
CORE = set(range(0x20, 0x7F)) | set(map(ord, "‘’“”–—…·•"))


def parse_ranges(text):
    cps = set()
    for part in text.split(","):
        start, _, end = part.strip().removeprefix("U+").partition("-")
        cps |= set(range(int(start, 16), int(end or start, 16) + 1))
    return cps


def format_ranges(cps):
    spans = []
    for cp in sorted(cps):
        if spans and cp == spans[-1][1] + 1:
            spans[-1][1] = cp
        else:
            spans.append([cp, cp])
    return [f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in spans]


def fetch(name, sha256):
    CACHE.mkdir(exist_ok=True)
    path = CACHE / name.replace("%5B", "[").replace("%5D", "]")
    if not path.exists():
        print(f"Downloading {path.name}")
        url = SOURCE_BASE + name
        if not url.startswith("https://"):
            sys.exit(f"Refusing to fetch {url}: only https sources are allowed.")
        # The URL is a fixed https constant and the file is hash-checked below.
        with urllib.request.urlopen(url) as response:  # nosec B310
            path.write_bytes(response.read())
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest != sha256:
        sys.exit(f"{path.name}: sha256 {digest}, expected {sha256}. Delete it from {CACHE} to refetch.")
    return path


# ---------------------------------------------------------------- crawl


class DistHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def send_error(self, code, *args, **kwargs):
        # Serve the site's own 404 page like the host does.
        if code == 404 and (Path(self.directory) / "404.html").exists():
            body = (Path(self.directory) / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            super().send_error(code, *args, **kwargs)


async def crawl_pages(base, urls, concurrency=8):
    from playwright.async_api import async_playwright

    collect = (HERE / "collect.js").read_text()
    results = {}
    queue = list(urls)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        # Text is all we need; skip images and fonts.
        await context.route(
            re.compile(r"\.(avif|webp|png|jpe?g|gif|svg|ico|woff2?)(\?|$)"),
            lambda route: route.abort(),
        )

        async def worker():
            page = await context.new_page()
            while queue:
                url = queue.pop()
                await page.goto(base + url, wait_until="load")
                results[url] = await page.evaluate(collect)
            await page.close()

        await asyncio.gather(*(worker() for _ in range(concurrency)))
        await browser.close()
    return results


def crawl(dist):
    if not (dist / "index.html").exists():
        sys.exit(f"No build in {dist}. Run `bun run build` first.")
    urls = ["/", "/a-page-that-does-not-exist/"] + sorted(
        f"/{p.parent.relative_to(dist).as_posix()}/" for p in dist.rglob("*/index.html") if "_astro" not in p.parts
    )
    handler = functools.partial(DistHandler, directory=str(dist))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        print(f"Crawling {len(urls)} pages in {dist}")
        return asyncio.run(crawl_pages(f"http://127.0.0.1:{server.server_port}", urls))
    finally:
        server.shutdown()


# ---------------------------------------------------------------- usage


def features_for(run):
    """OpenType features the browser asks the font for in this run."""
    feats = set(DEFAULT_FEATURES)
    for tag, value in re.findall(r'"(\w{4})"\s*(\w*)', run["featureSettings"]):
        if value in ("", "1", "on"):
            feats.add(tag)
        else:
            feats.discard(tag)
    numeric = run["variantNumeric"]
    for keyword, tags in {
        "tabular-nums": ["tnum"],
        "proportional-nums": ["pnum"],
        "diagonal-fractions": ["frac"],
        "ordinal": ["ordn"],
        "slashed-zero": ["zero"],
        "oldstyle-nums": ["onum"],
        "lining-nums": ["lnum"],
    }.items():
        if keyword in numeric:
            feats.update(tags)
    if run["variantCaps"] in ("small-caps", "all-small-caps"):
        feats.add("smcp")
    if run["variantPosition"] in ("sub", "super"):
        feats.add({"sub": "subs", "super": "sups"}[run["variantPosition"]])
    if "no-common-ligatures" in run["variantLigatures"]:
        feats.discard("liga")
    if run["kerning"] == "none":
        feats.discard("kern")
    if run["lang"].split("-")[0].lower() not in ("", "en"):
        feats.add("locl")
    return feats


def summarize(pages):
    """Per style: characters (with how many pages use each), weights, features."""
    styles = defaultdict(lambda: {"chars": Counter(), "weights": Counter(), "features": Counter(), "runs": set()})
    other = {"hyphens": Counter(), "langs": Counter()}
    for url, runs in sorted(pages.items()):
        seen = defaultdict(set)
        for run in runs:
            if not run["family"].startswith(FAMILY):
                continue
            style = "italic" if run["style"] != "normal" else "normal"
            info = styles[style]
            text = run["text"]
            if run["kind"] == "marker" and text.startswith("?"):
                print(f"  note: unknown list marker {text[1:]} on {url}")
                continue
            # An explicit wght variation overrides font-weight.
            explicit = re.search(r'"wght"\s+([\d.]+)', run["variationSettings"])
            weight = round(float(explicit.group(1) if explicit else run["weight"]))
            info["weights"][weight] += 1
            feats = features_for(run)
            for tag in feats:
                info["features"][tag] += 1
            other["hyphens"][run["hyphens"]] += 1
            other["langs"][run["lang"]] += 1
            seen[style] |= {ord(c) for c in text if c not in "\n\t\r"}
            info["runs"].add((text, weight, tuple(sorted(feats))))
        for style, cps in seen.items():
            styles[style]["chars"].update(cps)
    return styles, other


# ---------------------------------------------------------------- build


def axis_limits(source, weights):
    """Weight range to keep. Each side of the default is kept whole or
    dropped, and the font is only made static at the default weight. Anything
    else makes fontTools rescale or bake in the outline deltas and round them
    to whole units, which browsers interpolate exactly; in testing that moved
    points by up to a unit."""
    axis = next(a for a in source["fvar"].axes if a.axisTag == "wght")
    if set(weights) == {axis.defaultValue}:
        return axis.defaultValue
    return (
        axis.minValue if min(weights) < axis.defaultValue else axis.defaultValue,
        axis.maxValue if max(weights) > axis.defaultValue else axis.defaultValue,
    )


def drop_axis_side(font, limits):
    """Limit wght to one side of the default by deleting the deltas that only
    apply on the other side. They add nothing within the kept range, so every
    outline stays exactly as it was."""
    axis = next(a for a in font["fvar"].axes if a.axisTag == "wght")
    low, high = limits
    keep = lambda region: (low < axis.defaultValue or region[1] >= 0) and (high > axis.defaultValue or region[1] <= 0)
    gvar = font["gvar"]
    for glyph, variations in gvar.variations.items():
        gvar.variations[glyph] = [v for v in variations if keep(v.axes.get("wght", (0, 0, 0)))]
    # Advance widths, metrics and kerning keep their deltas in item variation
    # stores; drop the same regions' columns there.
    for tag in ("HVAR", "MVAR", "GDEF"):
        store = getattr(font[tag].table, "VarStore", None) if tag in font else None
        if not store:
            continue
        regions = store.VarRegionList.Region
        for data in store.VarData:
            columns = [i for i, r in enumerate(data.VarRegionIndex) if keep(_peak_triple(regions[r]))]
            data.VarRegionIndex = [data.VarRegionIndex[i] for i in columns]
            data.Item = [[row[i] for i in columns] for row in data.Item]
            data.VarRegionCount = len(columns)
        store.prune_regions()
    axis.minValue, axis.maxValue = low, high
    fvar = font["fvar"]
    fvar.instances = [i for i in fvar.instances if low <= i.coordinates["wght"] <= high]
    if "STAT" in font and font["STAT"].table.AxisValueArray:
        values = font["STAT"].table.AxisValueArray
        values.AxisValue = [v for v in values.AxisValue if low <= getattr(v, "Value", getattr(v, "NominalValue", low)) <= high]
        font["STAT"].table.AxisValueCount = len(values.AxisValue)


def _peak_triple(region):
    axis = region.VarRegionAxis[0]
    return (axis.StartCoord, axis.PeakCoord, axis.EndCoord)


def build_face(source_path, limits, cps, features):
    font = TTFont(source_path, recalcTimestamp=False)
    if isinstance(limits, tuple):
        drop_axis_side(font, limits)
    else:
        # At the default weight every delta is zero, so the static outlines
        # are the source's own.
        font = instancer.instantiateVariableFont(font, {"wght": limits}, updateFontNames=False)
    options = subset.Options()
    options.layout_features = sorted(features)
    options.hinting = False  # the source has no glyph instructions, only a prep table
    options.drop_tables += ["meta"]
    # Keep the licence description and URL (13, 14) with the copyright (0):
    # the OFL asks that every copy carry them.
    options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=cps)
    subsetter.subset(font)
    if "GDEF" in font and getattr(font["GDEF"].table, "VarStore", None):
        # Repack the kerning deltas without the rows that are now all zero.
        gdef = font["GDEF"].table
        mapping = gdef.VarStore.optimize()
        gdef.remap_device_varidxes(mapping)
        font["GPOS"].table.remap_device_varidxes(mapping)
    font.flavor = "woff2"  # Options.flavor only applies to the command line tool
    buffer = io.BytesIO()
    font.save(buffer)
    return buffer.getvalue()


# ---------------------------------------------------------------- checks


def check_face(data, source_path, cps, features, limits, runs):
    """Fail loudly if the file isn't exactly what we meant to write."""
    import uharfbuzz as hb
    from fontTools.pens.recordingPen import RecordingPen

    font = TTFont(io.BytesIO(data))
    source = TTFont(source_path)
    problems = []
    cmap = set(font.getBestCmap())
    if cmap != cps:
        problems.append(f"cmap has {len(cmap ^ cps)} unexpected differences")
    for table in ("fpgm", "prep", "cvt ", "cvar", "hdmx", "VDMX", "meta"):
        if table in font:
            problems.append(f"still has {table}")
    if "gasp" not in font:
        problems.append("lost its gasp table")
    glyf = font["glyf"]
    if any(getattr(glyf[g], "program", None) and glyf[g].program.getBytecode() for g in font.getGlyphOrder()):
        problems.append("still has glyph instructions")
    found = {r.FeatureTag for t in ("GSUB", "GPOS") if t in font for r in font[t].table.FeatureList.FeatureRecord}
    if not found <= set(features):
        problems.append(f"unexpected features {sorted(found - set(features))}")
    if isinstance(limits, tuple):
        axis = font["fvar"].axes[0]
        if (axis.minValue, axis.maxValue) != limits:
            problems.append(f"wght axis is {axis.minValue}-{axis.maxValue}, expected {limits}")
    elif "fvar" in font or "gvar" in font:
        problems.append("should be static")
    for table, attrs in {
        "head": ["unitsPerEm"],
        "hhea": ["ascent", "descent", "lineGap"],
        "OS/2": ["sTypoAscender", "sTypoDescender", "sTypoLineGap", "usWinAscent", "usWinDescent", "fsSelection", "xAvgCharWidth", "usWeightClass"],
    }.items():
        for attr in attrs:
            if getattr(font[table], attr) != getattr(source[table], attr):
                problems.append(f"{table}.{attr} changed")
    name_ids = {n.nameID for n in font["name"].names}
    referenced = set()
    if "fvar" in font:
        referenced |= {a.axisNameID for a in font["fvar"].axes}
        referenced |= {i.subfamilyNameID for i in font["fvar"].instances}
        referenced |= {i.postscriptNameID for i in font["fvar"].instances} - {0xFFFF}
    if "STAT" in font:
        stat = font["STAT"].table
        referenced |= {a.AxisNameID for a in stat.DesignAxisRecord.Axis}
        referenced |= {v.ValueNameID for v in (stat.AxisValueArray.AxisValue if stat.AxisValueArray else [])}
        referenced.add(stat.ElidedFallbackNameID)
    if referenced - name_ids:
        problems.append(f"name IDs {sorted(referenced - name_ids)} are referenced but missing")
    if not font["name"].getDebugName(13):
        problems.append("lost its licence description (name ID 13)")
    if "reserved font name" in font["name"].getDebugName(0).lower():
        problems.append("source has a Reserved Font Name: rename the family before shipping a subset")

    # Shape every crawled run, and every character alone, with both fonts.
    def hb_font(ttfont):
        buffer = io.BytesIO()
        ttfont.flavor = None
        ttfont.save(buffer)
        return hb.Font(hb.Face(buffer.getvalue()))

    new, ref = hb_font(font), hb_font(TTFont(source_path))

    def draw(hbfont, text, weight, feats):
        if hbfont is new and isinstance(limits, (int, float)):
            weight = limits
        hbfont.set_variations({"wght": weight})
        buf = hb.Buffer()
        buf.add_str(text)
        buf.guess_segment_properties()
        buf.language = "en"
        hb.shape(hbfont, buf, feats)
        glyphs = []
        for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
            pen = RecordingPen()
            hbfont.draw_glyph_with_pen(info.codepoint, pen)
            glyphs.append((info.cluster, pos.x_advance, pos.y_advance, pos.x_offset, pos.y_offset, pen.value))
        return glyphs

    weights = sorted({weight for _, weight, _ in runs}) or [400]
    samples = sorted(runs)
    samples += [("".join(map(chr, sorted(cps))), w, sorted(DEFAULT_FEATURES)) for w in weights]
    mismatched = 0
    for text, weight, feats in samples:
        text = "".join(c for c in text.replace("\n", " ").replace("\t", " ") if ord(c) in cps)
        if not text.strip():
            continue
        # The browser asks for every feature in the CSS; the reference only
        # gets the ones the old Google file had, since that's what it drew.
        asked = {tag: True for tag in feats}
        kept = {tag: True for tag in feats if tag in features}
        if draw(new, text, weight, asked) != draw(ref, text, weight, kept):
            mismatched += 1
            if mismatched <= 3:
                problems.append(f"draws {text[:40]!r} at {weight} differently from the source")
    if mismatched > 3:
        problems.append(f"... {mismatched} runs in all")
    return problems, len(samples)


# ---------------------------------------------------------------- main


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--dist", type=Path, default=ROOT / "dist", help="built site to crawl (default: dist)")
    args = parser.parse_args()

    pages = crawl(args.dist.resolve())
    styles, other = summarize(pages)
    google_latin = parse_ranges(GOOGLE_LATIN)
    allowed_chars = google_latin | set(map(ord, EXTRA_CHARACTERS))
    allowed_features = GOOGLE_FEATURES | EXTRA_FEATURES
    license_path = fetch(*LICENSE)

    manifest = {
        "family": FAMILY,
        "source": SOURCE_BASE,
        "faces": [],
    }
    usage = {"pages": len(pages), "hyphens": dict(other["hyphens"]), "langs": dict(other["langs"]), "styles": {}}
    outputs = {}
    failed = False

    # Italic first, as Google listed it: Astro sizes the generated fallback
    # face from the first file, and the italic one gives today's size-adjust.
    for style in ("italic", "normal"):
        info = styles.get(style)
        if not info:
            print(f"{style}: not used, skipped")
            continue
        source_path = fetch(*SOURCES[style])
        source = TTFont(source_path)
        source_cmap = set(source.getBestCmap())
        used = set(info["chars"])
        cps = source_cmap & (ALWAYS | CORE | (used & allowed_chars))
        left_out = sorted(c for c in used - cps if not (0x200B <= c <= 0x200D or 0xFE00 <= c <= 0xFE0F))
        features = {t for t in info["features"] if t in allowed_features}
        dropped = sorted(t for t in info["features"] if t not in allowed_features)
        limits = axis_limits(source, info["weights"])
        weight = f"{source['fvar'].axes[0].minValue:g} {source['fvar'].axes[0].maxValue:g}"

        usage["styles"][style] = {
            "weights": sorted(info["weights"]),
            "axis": limits,
            "features": sorted(features),
            "featuresAskedForButNotDrawn": dropped,
            "characters": "".join(chr(c) for c in sorted(used)),
            "pagesPerCharacter": {chr(c): n for c, n in sorted(info["chars"].items()) if c > 0x7E},
            "leftToFallback": "".join(chr(c) for c in left_out),
        }
        for part, part_cps in (("core", cps & CORE), ("ext", cps - CORE)):
            name = f"geist-{style}-{part}.woff2"
            data = build_face(source_path, limits, part_cps, features)
            problems, checked = check_face(data, source_path, part_cps, features, limits, info["runs"])
            outputs[name] = data
            # The descriptor stays 100 900 as before, so font matching and
            # the fallback faces Astro generates are unchanged.
            manifest["faces"].append(
                {"file": name, "style": style, "weight": weight, "subset": part, "unicodeRange": format_ranges(part_cps)}
            )
            status = "ok" if not problems else "FAILED"
            print(f"{name}: {len(data):,} bytes, {len(part_cps)} characters, wght {limits}, {checked} runs checked: {status}")
            for problem in problems:
                print(f"  - {problem}")
            failed |= bool(problems)
        if left_out:
            print(f"  {style}: drawn by the fallback font as before: {''.join(map(chr, left_out))}")
        if dropped:
            print(f"  {style}: asked for by CSS but not drawn before, left out: {', '.join(dropped)}")

    if failed:
        sys.exit("Some files failed their checks, so nothing was written; see above.")
    OUT.mkdir(parents=True, exist_ok=True)
    for stale in OUT.glob("geist-*.woff2"):
        if stale.name not in outputs:
            stale.unlink()
    for name, data in outputs.items():
        (OUT / name).write_bytes(data)
    (OUT / "OFL.txt").write_bytes(license_path.read_bytes())
    (OUT / "geist.json").write_text(json.dumps(manifest, indent=2) + "\n")
    (HERE / "usage.json").write_text(json.dumps(usage, indent=2, ensure_ascii=False) + "\n")
    if other["hyphens"].get("auto"):
        # Browsers draw the hyphen with U+2010 only if the first font has it.
        print("note: some text uses hyphens: auto; the core has no U+2010, so it hyphenates with U+002D as before")


if __name__ == "__main__":
    main()
