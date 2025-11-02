---
title: "Raise Your First Pull Request as a Designer"
description: "A step-by-step guide for designers to ship a focused, review-friendly pull request without becoming a developer."
pubDate: "2025-11-02T00:00:00.000Z"
---

You don’t need to “become a developer” to open a good pull request. You just need a tiny, focused change and a clear story.

---

## Pick a tiny win

Ship something you can finish today:

* Swap hard-coded values for **tokens** (spacing, color, radius).
* Add/standardize **states** (hover, focus, disabled, loading).
* Fix **copy** via i18n keys.
* Clean up an **empty state** component.

Small scope keeps the diff readable and review friendly.

---

## Branch + title

* Branch: `feat/ui-empty-state-invoices` or `fix/tokens-modal-spacing`
* Title (area + intent):
  `feat(ui): consistent focus ring across buttons`

Clear names help teammates scan and trust your change.

---

## Tell a short story (paste this)

**Context** — What’s off? Who feels it?
**Proposal** — The smallest change that fixes it (and what you didn’t touch).
**Evidence** — Before/After (light & dark), a 10–15s GIF, Storybook link.
**Verify** — Exact steps/URL/flags to reproduce.
**Blast radius** — Files touched, tokens changed, components affected.
**Rollout** — Behind a flag? Any fallback?

---

## The checklist reviewers love

**Visual**

* [ ] Before/After screenshots (light/dark)
* [ ] Edge cases (long text, error, loading)
* [ ] Responsive at sm/md/lg

**A11y**

* [ ] Contrast passes
* [ ] `:focus-visible` ring present
* [ ] Useful labels/roles (or remove redundant ones)

**Tokens**

* [ ] No raw hex/px; use semantic tokens (`fg.muted`, `bg.surface`, `space.x`)

**Perf/QA**

* [ ] No new heavy assets
* [ ] Storybook story added/updated
* [ ] Repro steps work on a clean checkout

---

## What to attach

* **Screenshot grid**: Before/After × light/dark in one image
* **15s GIF**: keyboard nav → focus → error → loading
* **Links**: Figma frame (versioned), Storybook story ID

---

## Tiny example (tokens + focus)

```tsx
// before
<button className="px-3 py-2 text-white bg-[#1a73e8] rounded-[4px]">
  Pay invoice
</button>

// after
<button
  className="
    px-space-3 py-space-2
    text-fg-on-primary bg-bg-primary
    rounded-radius-2
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline
  "
>
  {t('invoices.payCta')}
</button>
```

---

## Ship it

Open the pull request. Ask for one engineer and one designer to review. The goal isn’t perfect code—it’s a **clear, safe change** that moves the system forward. If it takes more than a day, the scope is too big. Slice it and try again.
