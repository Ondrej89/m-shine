# Magic Shine

Static, trilingual marketing site for Magic Shine — a cleaning company serving Vienna.
Built with [Astro](https://astro.build); a rebuild of the previous WordPress site, with the
booking engine replaced by quote requests.

## Commands

Run these from the project root.

| Command           | What it does                                                                |
| ----------------- | --------------------------------------------------------------------------- |
| `npm install`     | Install dependencies (only needed once, or after pulling a lockfile change).  |
| `npm run dev`     | Dev server with hot reload at **http://localhost:4321**.                      |
| `npm run build`   | Type-check, then build the static site into `dist/`.                          |
| `npm run preview` | Serve the built `dist/` exactly as production will.                           |
| `npm run check`   | Type-check only — includes the translation-completeness check.                |

`npm run build` runs `astro check` first, so a missing translation key fails the build
rather than shipping a German string onto a Slovak page.

The dev and preview servers run in the background. Manage them with
`npx astro dev status|logs|stop` and `npx astro preview status|logs|stop`.

## Languages and URLs

German is the primary market, so it is the default locale and is served from the root.

| Language        | URL     | `<html lang>` | hreflang        |
| --------------- | ------- | ------------- | --------------- |
| German (Austria) | `/`     | `de-AT`       | `de-AT`, `de`   |
| English         | `/en/`  | `en`          | `en`            |
| Slovak          | `/sk/`  | `sk`          | `sk`            |

`x-default` points at the German root. Every page emits a reciprocal, self-referencing,
fully-qualified hreflang set, and `@astrojs/sitemap` mirrors it into `sitemap-index.xml`.

## Layout

```
src/
  i18n/
    config.ts        locale registry — codes, BCP-47 tags, hreflang, endonyms
    routes.ts        route registry — one entry per page, slug per language
    ui.ts            t() / useTranslations(), with compile-time key checking
    de.json          German strings (source of truth for the key set)
    en.json  sk.json
  data/site.ts       business facts that are the same in every language
  content-pages/     page bodies — written ONCE, rendered for all three languages
  pages/
    [...path].astro  the site's only route; expands routes x locales
  layouts/
    BaseLayout.astro <head>, canonical, hreflang, OpenGraph, font preloads
    PageLayout.astro BaseLayout + header + main + footer
  components/        the design system — see /styleguide/
  styles/
    tokens.css       design tokens (from the WordPress theme.json / style.css)
    fonts.css        self-hosted @font-face
    base.css         element defaults and the container widths
    components/      lifted component CSS, one file per group
    global.css       the entry point — imports all of the above
public/fonts/        4 self-hosted variable woff2 files — no Google CDN
public/img/          logo, flourishes, photos
```

## The styleguide

Every component rendered on one page, in whichever language you switch to:

- <http://localhost:4321/styleguide/> (also `/en/styleguide/`, `/sk/styleguide/`)

It is an internal review tool — kept out of the sitemap, and deleted before launch.

### Adding a page

1. Add an entry to `ROUTES` in `src/i18n/routes.ts` with its slug in each language.
2. Add its strings to `de.json`, `en.json`, `sk.json`.
3. Add a component in `src/content-pages/` and register it in the `PAGES` map in
   `src/pages/[...path].astro`.

That produces all three language URLs. Never copy a page per language.

## Reference material

`_wp-theme-reference/` and `_design-reference/` are read-only inputs, not part of the build.
The WordPress theme is the **refined** source — it carries many rounds of corrections to
container widths, heading sizes per breakpoint, gutter steps, the photo mask-fade and the
mobile footer — so it wins over the design files wherever the two disagree.

## Deployment

### GitHub Pages preview

`.github/workflows/pages.yml` builds the site and publishes it to GitHub Pages on every
push to `main` (or `master`), and on demand from the Actions tab. It publishes to
`https://<user>.github.io/<repo>/`.

**One setting has to be right, and it is not set by the workflow:**
**Settings → Pages → Build and deployment → Source** must be **GitHub Actions**.

The workflow asks `actions/configure-pages` to enable Pages if it is off, but that enables
it with the *branch* source, which makes GitHub run its own Jekyll build of the repository
and serve the README instead of the built site. Both deployments then race and Jekyll wins.
If the site at the Pages URL looks like a rendered README, this is why: switch the source
to GitHub Actions and re-run the workflow.

The workflow does not hard-code the repository name. `actions/configure-pages` reports the
origin and the subpath, and they are passed to the build as `PAGES_SITE` and `PAGES_BASE`,
which `astro.config.mjs` reads. Nothing else changes between the two builds.

To reproduce a Pages build locally:

```bash
PAGES_SITE=https://example.github.io PAGES_BASE=/repo-name/ npm run build
```

Note that the preview build's canonical URLs and hreflang point at the Pages URL. That is
right for a preview and wrong for production — the production build (no env vars) uses
`SITE`.

**Paths under a subpath.** Astro rewrites the assets it emits, and Vite rewrites `url()`
references to `public/` inside CSS. Neither rewrites an absolute path written as a string
in markup, so links, `<img src>`, font preloads and the favicon go through `withBase()` in
`src/lib/paths.ts`. If you add one of those, use it — otherwise it will 404 on Pages while
working perfectly on localhost.

`public/.nojekyll` stops GitHub from running Jekyll, which would otherwise ignore the
`_astro/` directory because of its leading underscore.

## Before launch

- Set the real origin in `astro.config.mjs` (`SITE`). hreflang and canonical URLs are
  absolute and are built from it.
