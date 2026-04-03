# Copilot instructions for Website_DevConf

## Big picture
- This is a Jekyll-powered static site for DevConf. Most pages are thin Liquid/front-matter wrappers around shared layouts and includes.
- Shared site behavior lives in `_layouts/default.html`; it loads the compiled CSS and the bundled frontend script from `scripts/devconf.js`.
- The browser code is a single Webpack bundle built from `src/devconf.ts`. That entrypoint imports page modules (`event`, `feedback`, `speakerFeedback`, `sponsorBlock`, `cookieConsent`) and each module only runs when its page-specific root element exists.
- Data-driven content comes from `_data/` and `site.data.config`, with year-specific event data used by the Liquid includes.

## Commands
- `yarn install`
- `yarn start` — runs Jekyll plus the CSS and JS watch processes
- `yarn run watch-css` — rebuilds `public/css/main.css`
- `yarn run watch-code` — rebuilds `scripts/devconf.js` from `src/devconf.ts`
- `jekyll build` — production site build
- `jekyll serve` — local Jekyll server with incremental updates
- No automated `test` or `lint` script is defined in `package.json`

## Conventions
- TypeScript uses 4-space indentation, LF line endings, UTF-8, and no trailing newline from `.editorconfig`.
- The TS style in `eslint.config.mjs` is semicolonless, allows long lines up to 200 chars, and keeps a few rules relaxed (`no-use-before-define`, `no-plusplus`, `no-param-reassign`, etc.).
- Keep DOM contracts in sync across Liquid and TS. IDs, classes, `data-*` attributes, and `<template>` names are the contract between `_includes/*.html` and `src/*.ts`.
- Reuse helpers in `src/common.ts` for template cloning, text updates, and popup wiring instead of duplicating DOM logic.
- Page modules are intentionally guarded by presence checks on their root elements so the shared bundle can run on every page.
- `sessionStorage` is used for fetched Sessionize data and cached feedback structure; `localStorage` stores user preferences and draft feedback state.
- If you change frontend source, remember that the committed bundle in `scripts/` is what the site loads.
