---
title: "Install Tailwind on Hugo"
description: "Hugo has come a long way, now it has postcss support built in so we can now use all the goodness that comes with it. In this blog let's install TailwindCSS on Hugo."
date: 2020-06-03T11:37:15+00:00
---

Tested on Hugo Version 0.72.0 and Tailwind Version 1.4.6, learn how to [install Hugo here](https://gohugo.io/getting-started/installing/).

[Just show me the repo](https://github.com/praveenjuge/hugo-tailwind)

## Setup New Hugo Site

Let's create a new empty hugo site to test on:

```sh
hugo new site hugo-tailwind
cd hugo-tailwind
```

Run the above command on your terminal, it will create a new folder called `hugo-tailwind` which contains our new Hugo site.

Now let's use the command below to remove some folders that we don't need. **Please don't do this on existing sites, I don't have lawyers.**

```sh
rm -rf archetypes data static themes content
```

Next let's create some files. The command below will create what we need.

```sh
mkdir assets/css layouts/_default

touch layouts/index.html layouts/_default/baseof.html assets/css/main.css postcss.config.js tailwind.config.js
```

In `layouts/_default/baseof.html`, add:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{ .Title }}</title>

    {{ $styles := resources.Get "css/main.css" }}
    {{ $styles = $styles | resources.PostCSS (dict "inlineImports" true) }}

    {{ if hugo.IsProduction }}
      {{ $styles = $styles | minify }}
    {{ end }}

    <link href="{{ $styles.Permalink }}" rel="stylesheet" />
  </head>

  <body>
    {{ block "main" . }}{{ end }}
  </body>
</html>
```

In `layouts/index.html`, add:

```html
{{ define "main" }}
  <h1 class="container mx-auto mt-5 text-3xl">Hello from the other side!</h1>
{{ end }}
```

<!-- Now if you run `hugo server` in your terminal and you should see this:

Screenshot of hugo site without styles -->

Now let's add tailwind.

## Install Packages

Run the following command in your terminal to add a package.json file, complete the steps that it asks for.

```sh
npm init
```

Then install the following packages,

```sh
npm install tailwindcss postcss-cli autoprefixer --save
```

## Postcss Config

On `postcss.config.js` in the root of our folder, all the following code:

```js
module.exports = {
  plugins: [require("tailwindcss"), require("autoprefixer")],
};
```

This will make sure you import tailwind on our project.

## Tailwind Config

On `tailwind.config.js` in the root of our folder, all the following code:

```js
module.exports = {
  purge: {
    content: ["./layouts/**/*.html", "./content/**/*.md", "./content/**/*.html"],
  },
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
```

This will help us when we are customizing tailwind. Next add the following to `assets/css/main.css` to get the sweet tailwind css on our project.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Now if you run `hugo server` in your terminal and you should see this:

![Screenshot of hugo site with tailwind styles](1.png)

## Limitations

You have to run the final production site with node env for proper purge css to happen on production.

```sh
NODE_ENV=production hugo
```

And the build speed seems to suffer a lot by adding all this. So let me know if there are any better ways for approaching this.
