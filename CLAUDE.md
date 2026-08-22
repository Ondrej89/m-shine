# Magic Shine — working notes

Static Astro site, three languages, no backend. See `README.md` for commands and layout.

## Reference material, in order of authority

1. **`_wp-theme-reference/`** — `theme.json` + `style.css` from the WordPress build. This is
   the **refined** version: it contains many rounds of fixes (container widths, corrected
   heading sizes per breakpoint, gutter steps, the photo mask-fade, mobile layout
   corrections, the footer's two-column mobile layout). Treat it as authoritative for every
   token value and every responsive decision.
2. **`_design-reference/`** — the original approved `.dc.html` pages, `wm-*` flourishes,
   `logo-mark.png`, photos in `slots/`. Use for layout and structure.
3. The same design rendered live at <https://ondrej89.github.io/MagicShineWeb/>.

Where 1 and 2 disagree, 1 wins — the style.css comments usually explain why it deviates.

Neither folder is part of the build, and both are excluded from `tsconfig.json`.

## Rules that are easy to get wrong

**Write a page once.** Pages live in `src/content-pages/` and are rendered for all three
languages by `src/pages/[...path].astro`. There is no per-language page file, and there
should never be one.

**Every visible string comes from `src/i18n/*.json`.** No literal user-facing text in a
component. `de.json` defines the key set; `astro check` fails if `en.json` or `sk.json` is
missing a key, and `npm run build` runs that check.

**German is `de` in routing but `de-AT` everywhere a search engine looks.** The routing code
stays short because German is the unprefixed default locale; `src/i18n/config.ts` maps it to
`de-AT` for `<html lang>`, hreflang and `og:locale`. Vienna is the market — do not let a
bare `de` become the only German signal.

**Author CSS against `--ms-*` tokens.** `src/styles/tokens.css` also defines `--wp--*`
aliases; those exist *only* so rules can be lifted out of the refined `style.css` verbatim
during the port, without a rename pass that might silently change a value. Do not write new
CSS against them.

**Fonts are self-hosted variable fonts.** Four woff2 files in `public/fonts/` cover every
weight of both families (Playfair `wght` 400–900, Mulish `wght` 200–1000), latin +
latin-ext. Never add a Google Fonts `<link>`. latin-ext is required — Slovak depends on it.

**Keep the metric-matched fallbacks in the font stacks.** `'Playfair Fallback'` and
`'Mulish Fallback'` (fonts.css) are `size-adjust`-ed aliases for the system faces, and they
must stay second in `--ms-font-heading` / `--ms-font-body`. Without them `font-display: swap`
reflows the page when the real font arrives: Playfair and Georgia differ by under 1% in
width, which was enough to tip the German h1 onto a fifth line and move everything below it
61px — measured CLS goes from 0 back to a visible jump. If you change a font, re-measure the
ratio (canvas `measureText` at 100px over a representative string) and update `size-adjust`.

**Component CSS is global, not scoped.** It lives in `src/styles/components/*.css` and is
pulled in by `global.css`. That is deliberate: the lifted rules reach across component
boundaries (`.ms-header__panel .ms-bookbtn`, `.ms-card::after`, the shared responsive
steps), and scoping them would mean rewriting those relationships — the exact risk the
`--wp--*` aliases exist to avoid. `.astro` files carry markup; only genuinely
page-local scaffolding gets a scoped `<style>`.

**Watch the container width.** The design uses five, and each is load-bearing — the reviews
carousel is 1180px, not the page's 1240, and getting it wrong made that section 34px taller
than the design. `<Section width={...}>` picks; the list is in `base.css`.

**Don't let the CSS minifier lower media queries.** `vite.build.cssTarget` is pinned in
`astro.config.mjs`. Without it the minifier rewrites `(max-width: 720px)` to
`(width <= 720px)`, which parses as nothing on Safari below 16.4 — every breakpoint gone at
once on an iOS 16.0–16.3 phone. If you change that setting, re-check the built CSS.

**Check the layout at 375px and at ~1180px before calling a page done.** Both have already
caught real bugs that were invisible at a typical desktop width, and both were the same
cause: a grid or flex track refuses to shrink below its content's `min-content`, so one
long German word or one wide row silently pushes the whole layout past the viewport where
`overflow-x: hidden` swallows it. `min-width: 0` on the item is the fix. The window in this
environment may not resize — a sized `<iframe>` pointing at the page triggers media queries
correctly and is a fine substitute.

## Current state

Steps 1 (setup + i18n), 2 (component library) and 3a (Home) are done.

- `src/content-pages/Home.astro` is the real page, composed from six section components in
  `src/components/sections/`. `ServicesGrid` takes its services as a prop so the Services
  page can reuse it with a fifth entry.
- `src/components/` holds the design system. `src/content-pages/Styleguide.astro` renders
  all of it at `/styleguide/` — an internal review tool. Delete it, its `ROUTES` entry and
  its sitemap filter before launch.
- `src/content-pages/Placeholder.astro` is a stub standing in for About, Services, Pricing,
  Contact and Quote so every nav link resolves. Replace them one at a time; when the last
  one goes, delete the stub.

Content is the existing site's, authored in English and translated. New content — "Warum
Magic Shine", a B2B page, reframed pricing, the quote form — comes after the existing pages
are ported.

## Before launch

- Real origin in `astro.config.mjs` (`SITE`) — hreflang and canonicals are built from it.
- Real business details in `src/data/site.ts` (phone, email, address, socials).
- A newsletter endpoint in `SITE_DETAILS.newsletterAction`. Until it is set, the footer form
  renders but refuses to submit and says so.
- Remove the styleguide and the placeholder stub.
