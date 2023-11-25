---
title: Add all Tailwind 2 Color Palettes to your config
description: Tailwind 2 has eight default color palette that you can use in your
  project, but internally it ships with 22 colour palettes. Here is how you can
  import them all. This increases your css size by a lot so make sure you purge
  during production build.
publishedAt: 2021-02-04T15:40:42.877Z
---

```javascript
//tailwind.config.js
const colors = require("tailwindcss/colors");

module.exports = {
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      "blue-gray": colors.blueGray,
      "cool-gray": colors.coolGray,
      gray: colors.gray,
      "true-gray": colors.trueGray,
      "warm-gray": colors.warmGray,
      red: colors.red,
      orange: colors.orange,
      amber: colors.amber,
      yellow: colors.yellow,
      lime: colors.lime,
      green: colors.green,
      emerald: colors.emerald,
      teal: colors.teal,
      cyan: colors.cyan,
      sky: colors.sky,
      blue: colors.blue,
      indigo: colors.indigo,
      violet: colors.violet,
      purple: colors.purple,
      fuchsia: colors.fuchsia,
      pink: colors.pink,
      rose: colors.rose,
    },
  },
};
```
