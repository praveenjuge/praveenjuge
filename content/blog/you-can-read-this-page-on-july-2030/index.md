---
title: "You can read this page on July 2030"
description: "Bookmark this page and come back after 10 years. You will see the same page with same content. But what about after 50 years? After 100? Will the browser you bookmarked this page work after 100 years?"
date: 2020-06-30T18:37:57+0000
---

I love anything that is long lasting. Trees, Tortoise, Hugh Hefner.

The modern web is volatile, constantly evolving and prone to break at a thousand different points. It’s a constant challenge to support all the devices that can access the web and even more scary when you think about the future.

But the web has one big supporter on it’s side. **Backwards Compatibility**. HTML and CSS written in 1999 can still be seen without any problem. Even JavaScript has excellent backwards compatibility.

But how can **we** make our content last?

I came across this manifesto called [Designed to Last](https://jeffhuang.com/designed_to_last/) by Jeff Huang where he has similar ideas. His advice was to make your build process simple and go back to HTML/CSS.

Here are the steps I’ve taken to ensure that this [site](https://praveenjuge.com) works for the forseeable future:

## Two external services

Netlify and GitHub are the only services that is needed for this site to work. I’ve brought this domain and host the static HTML files on netlify. The layouts and content files are stored in GitHub.

I trust both of these services to work for a long but I have backup plans if any one of them stopped working.

## Hugo for creating static pages

Hugo is a static site generator. It takes my layouts in HTML and content in Markdown and converts it into HTML format.

- Hugo is available in binary format and it can be installed anywhere.
- Hugo is well maintained and has a big community support.
- New version releases doesn’t break the older versions.

And most importantly, it’s fast and easy to work with.

## No Third Party Domains

All the files are in this website are served from `praveenjuge.com`. The more the external domains you hit, the more chance that something will break. Better safe than sorry.

## No Analytics

Analytics has some benefits, but 90% of analytics is just problems. My marketing brain always tells me to add some form of analytics to every website I make.

But I convinced myself to let go and removed the need to measure vanity metrics.

## Self Hosted Fonts

This site uses **Merriweather** font which is self hosted on this website rather from Google Fonts. This means that I have to update it to the latest version from time to time. But that’s better than having to hit Google’s domain.

## No JavaScript

I’m gonna be honest with you, I don’t like JavaScript that much. I write it all the time, I understand how it works, I even like React and other JavaScript frameworks. But it seems to be cause of most of the bloat on the web today.

And for a blog site, I don’t see the reason to add any JavaScript.

## Compressing images, checking broken links

I compress all the images before uploading to the GitHub repo so that everything stays easy to download at all network speeds.

And I use an Netlify Plugin called [Checklinks](https://github.com/munter/netlify-plugin-checklinks#readme) to check for broken links in the build process.

## And then life happens...

I get lazy. Netlify doesn’t work anymore. I’ve moved on to carpentry.

Just like that I may forget about this website. But I didn’t want that to happen. So this blog post is my commitment to make this website for at-least the next 10 years.

Go ahead and bookmark this page. Visit it after 10 years. It will work as intended and will probably look the same.

But no one can promise 50 years.
