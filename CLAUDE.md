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

## Current state

Step 1 (setup + i18n foundation) is done. `src/content-pages/Home.astro` is a placeholder
that exists to prove the plumbing; its `.ms-probe` readout and inline styles are scaffolding
and get deleted when the real home page is built.
