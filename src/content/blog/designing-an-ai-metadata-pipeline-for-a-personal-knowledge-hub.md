---
title: "Designing an AI Metadata Pipeline for a Personal Knowledge Hub"
description: "How Teak uses a simple, predictable AI pipeline to quietly make sense of all your saved links, screenshots, notes, and files."
pubDate: "2025-11-30T14:18:58.447Z"
---

Teak is a personal knowledge hub.
You save links, screenshots, notes, files.
Teak's job is to quietly make sense of all that. ([Teak](https://teakvault.com))

The way it does that is through **metadata**.

Not the glamorous kind.
The boring kind that makes everything else possible.

---

## Metadata as a promise

For every card in Teak, I treat metadata like a **promise**:

- There will be a title.
- There might be a short description.
- There will be tags.
- The shape of this data will not surprise you.

That promise is written down as a **schema**:

- In the backend (Convex)
- In the web app
- In the browser extension

Same fields. Same types. Same meaning.

The AI model doesn't get to invent new shapes.
It only gets to fill in the blanks.

---

## The simple pipeline

Most AI products hide behind magic.
Teak is more like a kitchen.

For each thing you save, the pipeline is:

1. **Scrape**
   Grab what we can without AI: title tags, HTML, file info.

2. **Enrich**
   Clean it up. Normalize URLs. Strip noise. Prepare a clear input.

3. **AI**
   Send a single, boring request:
   "Given this content, return JSON in *this* format. Nothing else."

4. **Post-process**
   Check the JSON. Trim it. Sanity-check tags. Throw away junk.

5. **Card UI**
   Show a card that feels "smart", but is really just consistent.

From the user's point of view:
a rough card appears → a few seconds later, it sharpens into something useful.

---

## Making AI boring on purpose

The hard part is not getting AI to be clever.
It's getting it to be **predictable**.

So I give it constraints:

- A fixed schema.
- A clear role ("help a designer find this later").
- Limits ("1–8 tags, all lowercase, no poetry").

Then I add guardrails:

- If the JSON is broken, I ignore it.
- If the AI title is worse than the original, I keep the original.
- If tags are nonsense, I hide them instead of forcing them.

The result is an AI system that feels calm:

- The UI rarely breaks.
- Filters work because tags are stable.
- You can design around the behavior and trust it.

---

In the end, "AI metadata pipeline" sounds complex.
But the idea is simple:

- **One contract** for metadata.
- **One pipeline** that respects it.
- **One boring AI** that behaves well enough
  for you to build a beautiful product on top.
