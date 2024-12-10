---
title: "Why I Switched My Website from Next.js to Astro"
description: "I wanted to share my recent experience with astro.build. If you’re into static site generators—or even if you're just curious about how to build simple, fast websites—this one’s for you."
pubDate: "2024 dec 10"
---

[Astro](https://astro.build/) (or Astro.js) is a relatively new kid on the block in the world of static site generators. But I’ve gotta say, it’s got some neat tricks up its sleeve. I recently revamped my personal website, **praveenjuge.com**, using Astro, and spoiler alert: I’m a fan.

### Why Switch to Astro?

Before Astro, my site was built on [Next.js](https://nextjs.org/), using its static build option. It worked fine, but honestly, for a simple blog and design showcase like mine, Next.js was overkill. I didn’t need a full ReactJS to download every time someone visited my site—just plain HTML and CSS would do.

I’ve dabbled with other static site generators like [Hugo](https://gohugo.io/), [Jekyll](https://jekyllrb.com/), and [Middleman](https://middlemanapp.com/), but Astro caught my eye. I had used it for some client projects and loved how straightforward it was. Plus, it has some standout features that made me take the plunge:

- **Content Collections**: With Astro, I didn’t have to manually parse Markdown files or handle syntax highlighting—it’s all baked in.
- **Zero JavaScript by Default**: This is a big deal. My site doesn’t need JavaScript to function, so having zero js by default is a massive win.
- **Built-in Integrations**: From prefetching links to inline stylesheets, Astro makes these tasks a breeze.

And the latest Astro v5 version has made content management even easier.

### The Migration Process

Switching from Next.js to Astro took me about 3-4 hours, thanks to Astro’s simplicity and the small size of my site. Deployment was another smooth process. While I initially used GitHub Pages, I eventually moved to Cloudflare Pages for their free tier and analytics. Highly recommend it if you’re looking for a reliable deployment option.

### Pros of Astro

1. **Performance**: My website size shrunk by 50% just by removing all the React/Next.js-related JavaScript. Now, it’s super lightweight and fast.
2. **Developer Experience**: The CLI wizard for creating a new project is fantastic. It’s easy to add integrations and feels very “web-native.”
3. **Type Safety**: If you love TypeScript, Astro has you covered with full type safety.
4. **CMS Simplicity**: I’ve been using [Cursor](https://cursor.com/) as my CMS for Astro, and while it’s not a traditional CMS, it gets the job done with minimal hassle.

### Cons of Astro

No tool is perfect, right? Here are a couple of areas where Astro could improve:

- **Prefetching Isn’t Perfect**: Compared to Next.js’s `Link` tag, Astro’s prefetching feels a bit clunky, especially on some browsers.
- **More docs on Content Collections**: I struggled to create web pages dynamically from images in a folder. It might be a documentation gap—or a skill issue in my side—but either way, it could be more intuitive.

### Final Thoughts

For static sites, Astro gets a big thumbs up from me. It’s fast, efficient, and developer-friendly. While it’s not yet ready to take on full-fledged web apps (though it’s evolving with features like actions), it’s perfect for content-focused projects.

If you’re considering a switch—or starting a new project—give Astro a shot. You might just love it as much as I do!
