// Runs inside each built page (see subset.py). Returns every piece of text the
// page can draw, with the computed font settings that decide which face,
// weight and OpenType features draw it. Hidden text counts too: it can show
// on hover, at another width or once a script runs.
() => {
  const runs = [];
  const caseOf = (text, transform) =>
    transform === "uppercase"
      ? text.toUpperCase()
      : transform === "lowercase"
        ? text.toLowerCase()
        : transform === "capitalize"
          ? text.replace(/(^|\s)(\S)/g, (_, space, letter) => space + letter.toUpperCase())
          : text;
  const add = (element, style, text, kind) => {
    if (!text) return;
    // Clamped and truncated text ends in an ellipsis the browser draws.
    const clamped =
      (style.webkitLineClamp && style.webkitLineClamp !== "none") ||
      style.textOverflow === "ellipsis";
    runs.push({
      kind,
      text: caseOf(text, style.textTransform) + (clamped ? "…" : ""),
      family: style.fontFamily,
      style: style.fontStyle,
      weight: style.fontWeight,
      featureSettings: style.fontFeatureSettings,
      variantNumeric: style.fontVariantNumeric,
      variantLigatures: style.fontVariantLigatures,
      variantCaps: style.fontVariantCaps,
      variantPosition: style.fontVariantPosition,
      variantAlternates: style.fontVariantAlternates,
      variationSettings: style.fontVariationSettings,
      kerning: style.fontKerning,
      hyphens: style.hyphens,
      lang: element.closest("[lang]")?.getAttribute("lang") ?? "",
    });
  };
  const skip = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"]);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node; (node = walker.nextNode()); ) {
    const element = node.parentElement;
    if (!element || skip.has(element.tagName) || element.closest("svg")) continue;
    add(element, getComputedStyle(element), node.data, "text");
  }
  for (const element of document.body.querySelectorAll("*")) {
    if (skip.has(element.tagName) || element.closest("svg")) continue;
    for (const pseudo of ["::before", "::after"]) {
      const style = getComputedStyle(element, pseudo);
      // Only literal strings; counters and quotes would need their own handling.
      const literal = /^"(.*)"$/.exec(style.content);
      if (literal) add(element, style, literal[1], "pseudo");
    }
    const style = getComputedStyle(element);
    if (style.display.includes("list-item")) {
      const marker = getComputedStyle(element, "::marker");
      const text = { disc: "• ", circle: "◦ ", square: "▪ ", decimal: "0123456789. " }[
        style.listStyleType
      ];
      if (text) add(element, marker, text, "marker");
      else if (style.listStyleType !== "none") add(element, marker, `?${style.listStyleType}`, "marker");
    }
    if (element.matches("input, textarea")) {
      add(element, style, element.placeholder, "placeholder");
      add(element, style, element.value, "value");
    }
  }
  return runs;
};
