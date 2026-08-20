---
title: "I got tired of rebuilding shadcn in Figma, so I built Niram"
description: "Niram turns a shadcn/ui preset into native Figma variables, styles, components, and app blocks without the usual manual setup."
pubDate: "2026-08-21T00:00:00.000Z"
---

Every shadcn project started with the same 30 minutes in Figma. Background. Foreground. Primary. Muted. Then dark mode.

Same HSL values. Same variables. Same radius and fonts. Not hard. Just boring.

So I built [Niram](https://www.figma.com/community/plugin/1642487887236877076/niram-shadcn-design-system-generator).

## The boring problem

I have used Tailwind since the beta days. I made a Tailwind v3.4.4 system for Figma and [Myna UI](https://www.figma.com/community/file/1340017605248937608/myna-ui-tailwindcss-shadcn-ui-radix-premium-ui-kit) with shadcn and Radix. I like building design systems. Maybe too much.

But every new shadcn preset still meant manual work. Copy colors. Map them to variables. Wire light and dark. Set the radius. Load fonts. Change one thing in code and Figma drifts.

The variables are not the work. They are the setup before the work can start.

## Paste once, get the system

Niram turns a shadcn preset into one editable Figma page. Paste once and you get:

- Tailwind v4 colors and tokens — radius, spacing, typography, shadow, blur
- Light and dark theme variables
- Typography and effect styles
- Components you can swap
- App blocks — login, signup, dashboard, charts, sidebar — built from real instances

Everything is native Figma variables and styles. Edit it. Swap themes. Reuse it. Paste a different preset and it updates the same page in place.

It works offline. No analytics. No network. It only writes to the file where you run it.

## Three steps

1. Build a preset at [ui.shadcn.com/create](https://ui.shadcn.com/create) and copy its code.
2. Run [Niram in Figma](https://www.figma.com/community/plugin/1642487887236877076/niram-shadcn-design-system-generator).
3. Paste and generate. Done.

30 minutes becomes one step.

## When to use it

Already happy with the defaults in Myna UI or my Tailwind system? Duplicate those. Faster.

Got a specific shadcn preset — your colors, your radius, your type? Use Niram. Figma should start from the same decisions as your code, not an approximation.

If you work between shadcn and Figma, [try Niram](https://www.figma.com/community/plugin/1642487887236877076/niram-shadcn-design-system-generator) and tell me what breaks. I would rather fix it once than rebuild those variables again.
