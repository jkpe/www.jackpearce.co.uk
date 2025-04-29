---
title: The CSS :has() selector is finally here!
date: 2023-11-02
slug: css-has-selector
category: CSS, Web Development
keywords: css, web development, selectors, frontend
---

After years of waiting, we finally have the CSS `:has()` selector with broad browser support! This is a game-changer for styling based on children or related elements.

The `:has()` selector (also called the "parent selector") lets you select elements based on their descendants or siblings, which was previously impossible with CSS alone.

Some practical examples:

```css
/* Style a card differently when it contains an image */
.card:has(img) {
  padding-top: 0;
}

/* Style form fields when they contain required inputs */
.form-group:has(input[required]) {
  border-left: 3px solid red;
}

/* Style all paragraphs that are followed by a list */
p:has(+ ul) {
  margin-bottom: 0.5em;
}
```

This is especially useful for creating variants of components without adding extra classes. For example:

```css
/* Primary button styles */
.button {
  background: #eee;
  color: #333;
}

/* If button contains an icon, add some spacing */
.button:has(svg) {
  padding-left: 2.5em;
}

/* If button contains a loading spinner, disable hover effects */
.button:has(.spinner) {
  pointer-events: none;
}
```

Browser support is finally solid with Chrome, Safari, and Firefox (109+) all supporting it.

This means we can finally stop adding unnecessary wrapper elements or JavaScript just to handle parent-child styling relationships! 