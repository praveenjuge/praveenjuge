---
title: "Use Tailwind JIT with Hugo"
date: 2021-06-06T09:27:04+05:30
description: "Tailwind released a new CLI which made JIT watch mode possible. We can use it to integrate JIT into a Hugo site. Let's see how to do that."
---

[Just show me the repo &rarr;](https://github.com/praveenjuge/hugo-tailwind-jit)

## Setup New Hugo Site

Let's create a new hugo site to test on, run the following commands in your terminal:

```sh
hugo new site hugo-tailwind-jit
cd hugo-tailwind-jit
```

We have to add some new files for tailwind to work, so run the following command in your terminal:

```sh
touch layouts/index.html static/tailwind.css package.json tailwind.config.js
```

We are going to transform `static/tailwind.css` into `static/main.css`, which we will include in our hugo layout:

In `layouts/index.html` add the following code,

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello World</title>
    <link rel="stylesheet" href="/main.css" />
  </head>
  <body>
    <h1 class="p-20 text-2xl font-bold">Hello World</h1>
  </body>
</html>
```

## Add Tailwind

Let's add our tailwind code, add the following code to `static/tailwind.css`,

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

We have to add our build scripts for Tailwind's new CLI work for us.

In `package.json` add the following code,

```json
{
  "scripts": {
    "dev": "NODE_ENV=development ./node_modules/tailwindcss/lib/cli.js -i ./static/tailwind.css -o ./static/main.css --jit -w",
    "build": "NODE_ENV=production ./node_modules/tailwindcss/lib/cli.js -i ./static/tailwind.css -o ./static/main.css --jit --minify"
  },
  "dependencies": {
    "tailwindcss": "^2.2.0-canary.13"
  }
}
```

And next the basic Tailwind config, where we mention our JIT mode, and tell where to purge.

In `tailwind.config.js` add the following code,

```js
module.exports = {
  mode: "jit",
  purge: ["./content/**/*.md", "./content/**/*.html", "./layouts/**/*.html"],
};
```

## Install Dependencies

We only have tailwind as a dependency, install it by using the following code in your terminal:

```sh
npm install
```

## Development Server

For Tailwind watcher, run the following code in your terminal:

```sh
npm run dev
```

For Hugo Server, run the following code in another terminal tab:

```sh
hugo server
```

And go to [`http://localhost:1313`](http://localhost:1313) to see the Tailwind JIT enabled hugo server in action.

## Production Build

Our build script will minify the css while building for production, you can use the following combined script for building minified production ready code.

```sh
npm run build && hugo --minify
```

---

And don't forget to add `static/main.css` to your `.gitignore` file. Otherwise the automatically generated css file will be pushed to your repo.

That's it. ✨
