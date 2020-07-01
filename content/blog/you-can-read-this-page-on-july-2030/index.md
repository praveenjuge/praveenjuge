---
title: "You can read this page on July 2030"
description: "Bookmark this page and come back after 10 years. You will see the same page with the same content. But what about after 50 years? After 100? Will the browser you bookmarked this page work after 100 years?"
date: 2020-07-01T02:22:50+00:00
---

I love anything that is long-lasting. Trees, Tortoise, Hugh Hefner.

The modern web is volatile, constantly evolving, and prone to break at a thousand different points. It’s a constant challenge to support all the devices that can access web and its even more terrifying when you think about the future.

But the web has one big supporter on its side. **Backward Compatibility**. HTML and CSS written in 1999 can still be seen without any problem. Even JavaScript has excellent backward compatibility.

But how can **we** make our content last?

I came across this manifesto called [Designed to Last](https://jeffhuang.com/designed_to_last/) by Jeff Huang in which he shares similar ideas. His advice was to make your build process simple and go back to HTML/CSS.

Here are the steps I’ve taken to ensure that this [site](https://praveenjuge.com) works for the foreseeable future:

## Two external services

Netlify and GitHub are the only services that are needed to make this site work. I’ve brought this domain and hosted the static HTML files on netlify. The layouts and the content files are stored in GitHub.

I trust both of these services to work for a long time but I have backup plans if either of these services stopped working.

## Hugo for creating static pages

Hugo is a static site generator. It takes my layouts as HTML and content as Markdown and converts it into HTML format.

- Hugo is available in binary format and it can be installed anywhere.
- Hugo is well maintained and has big community support.
- New version releases won’t break the older versions.

And most importantly, it is fast and easy to work with.

## No Third Party Domains

All the files on this website are served from `praveenjuge.com`. The more the external domains you hit, the chances that something will break is higher. Better safe than sorry.

## No Analytics

Analytics has some benefits, but 90% of analytics is just problems. My marketing brain always tells me to add some form of analytics to every website I make.

But I convinced myself to let go and removed the need to measure vanity metrics.

## Self Hosted Fonts

This site uses **Merriweather** font which is self-hosted on this website rather than using Google Fonts. This means that I have to update it to the latest version from time to time. But that’s better than having to hit Google’s domain.

## No JavaScript

I’m gonna be honest with you, I don’t like JavaScript that much. I write it all the time, I understand how it works, I even like React and other JavaScript frameworks. But it seems to be the cause of most of the bloat on the web today.

And for a blog site, I don’t see a reason to add any JavaScript.

## Compressing images, checking broken links

I compress all the images before uploading it to GitHub repo so that everything stays easy to download at all network speeds.

And I use an Netlify Plugin called [Checklinks](https://github.com/munter/netlify-plugin-checklinks#readme) to check for broken links in the build process.

## And then life happens...

I get lazy. Netlify doesn’t work anymore. I’ve moved on to carpentry.

Just like that, I may forget about this website. But I don’t want that to happen. So this blog post is my commitment to make this website last for at least the next 10 years.

Go ahead and bookmark this page. Visit it after 10 years. It will work as intended and will probably look the same.

But no one can promise 50 years.
