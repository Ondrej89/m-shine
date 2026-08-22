# Magic Shine — working notes

Static Astro 7 site for a Vienna cleaning company. Three languages, no backend, no booking
engine (the old WordPress site's booking wizard becomes a quote request form). See
`README.md` for the commands and the directory map.

## Environment and workflow

```bash
npm install        # once
npm run dev        # dev server, http://localhost:4321
npm run build      # astro check && astro build -> dist/
npm run preview    # serves the built dist/ exactly as production will
npm run check      # type check only (includes the translation completeness check)
```

`npm run build` runs `astro check` first, so a missing translation key fails the build
rather than shipping a German string onto a Slovak page. Never bypass it.

**Astro 7 daemonises `dev` and `preview`.** The command returns immediately and the server
keeps running in the background. Manage it with:

```bash
npx astro dev status | logs | stop
npx astro preview status | logs | stop
```

If a port is busy Astro silently picks the next one — read the printed URL rather than
assuming 4321. Starting a second `preview` without stopping the first is the usual cause of
"my changes aren't showing": you are looking at the old daemon on the old port.

Windows: the Bash tool and the PowerShell tool share one working directory and it persists
between calls. `cd` to the project root explicitly if a previous call moved it. Heredocs
(`<<'EOF'`) get mangled by the shell wrapper — use the Write/Edit tools for multi-line file
content instead of shelling it out.

### Verifying in the browser

Every non-trivial layout bug on this project was found by measuring the rendered page, not
by reading the CSS. Do that. Three environment quirks are worth knowing:

- **The window may refuse to resize.** A sized `<iframe>` pointing at the page evaluates
  media queries against its own width and is a fine substitute. It can even be wider than
  the window — measurements stay valid, only the screenshot clips.
- **Media queries see the viewport _including_ the scrollbar**; `documentElement.clientWidth`
  does not. An iframe of 1101px reports `clientWidth` 1086 while `max-width: 1100px` does
  **not** match. Do not chase that as a bug.
- Smooth scrolling and scroll events are unreliable in the automated browser. Code that
  depends on them needs a fallback anyway — see the reviews carousel.

## Reference material, in order of authority

1. **`_wp-theme-reference/`** — `theme.json` + `style.css` from the WordPress build. The
   **refined** version: many rounds of fixes (container widths, corrected heading sizes per
   breakpoint, gutter steps, the photo mask-fade, mobile layout corrections, the footer's
   two-column mobile layout). Authoritative for every token value and responsive decision.
2. **`_design-reference/`** — the original approved `.dc.html` pages, `wm-*` flourishes,
   `logo-mark.png`, photos in `slots/`. Use for layout and structure.
3. The same design rendered live at <https://ondrej89.github.io/MagicShineWeb/>.

Where 1 and 2 disagree, 1 wins — the style.css comments usually explain why it deviates.
Neither folder is part of the build; both are excluded from `tsconfig.json`.

The theme is authoritative but not infallible. It has been overruled twice, both times with
a measurement and a comment saying why: the hero's fixed `750px` media column (it overflowed
every width below 1320px) and the mobile header panel's gutter/inset mismatch. If you
overrule it again, record the number that made you.

## Rules that are easy to get wrong

**Write a page once.** Pages live in `src/content-pages/` and are rendered for all three
languages by `src/pages/[...path].astro`. There is no per-language page file, and there
should never be one.

**Every visible string comes from `src/i18n/*.json`.** No literal user-facing text in a
component — the client edits these files. `de.json` defines the key set; `astro check` fails
if `en.json` or `sk.json` is missing a key.

**German is `de` in routing but `de-AT` everywhere a search engine looks.** The routing code
stays short because German is the unprefixed default locale; `src/i18n/config.ts` maps it to
`de-AT` for `<html lang>`, hreflang and `og:locale`. Vienna is the market — never let a bare
`de` become the only German signal.

**Author CSS against `--ms-*` tokens.** `src/styles/tokens.css` also defines `--wp--*`
aliases; those exist _only_ so rules can be lifted out of the refined `style.css` verbatim,
without a rename pass that might silently change a value. Do not write new CSS against them.

**Component CSS is global, not scoped.** It lives in `src/styles/components/*.css` and is
pulled in by `global.css`. Deliberate: the lifted rules reach across component boundaries
(`.ms-header__panel .ms-bookbtn`, `.ms-card::after`, the shared responsive steps), and
scoping them would mean rewriting those relationships. `.astro` files carry markup; only
genuinely page-local scaffolding gets a scoped `<style>`.

**Fonts are self-hosted variable fonts.** Four woff2 files in `public/fonts/` cover every
weight of both families (Playfair `wght` 400–900, Mulish `wght` 200–1000), latin +
latin-ext. Never add a Google Fonts `<link>`. latin-ext is required — Slovak depends on it.

**Keep the metric-matched fallbacks in the font stacks.** `'Playfair Fallback'` and
`'Mulish Fallback'` (fonts.css) are `size-adjust`-ed aliases for the system faces and must
stay _second_ in `--ms-font-heading` / `--ms-font-body`. Without them `font-display: swap`
reflows the page when the real font arrives: Playfair and Georgia differ by under 1% in
width, enough to tip the German h1 onto an extra line and move everything below it 61px, and
the hero photo 30px. Measured CLS goes from 0 back to a visible jump. If you change a font,
re-measure the ratio (canvas `measureText` at 100px over a representative string) and update
`size-adjust`.

**Watch the container width.** The design uses five and each is load-bearing — the reviews
carousel is 1180px, not the page's 1240. Each number is the width of the _content_, with the
gutter outside it; `.ms-container` adds `+ gutter * 2` to its `max-width` for exactly that
reason. `<Section width={...}>` picks; the list is in `base.css`.

**Do not let the CSS minifier lower media queries.** `vite.build.cssTarget` is pinned in
`astro.config.mjs`. Without it the minifier rewrites `(max-width: 720px)` to the range
syntax, which parses as nothing on Safari below 16.4 — every breakpoint gone at once on an
iOS 16.0–16.3 phone. If you change that setting, re-check the built CSS.

**Check 375px and ~1180px before calling a page done.** Both have caught real bugs invisible
at a typical desktop width, and always the same cause: a grid or flex track will not shrink
below its content's `min-content`, so one long German word silently pushes the layout past
the viewport, where `overflow-x: hidden` swallows it. `min-width: 0` on the item is the fix.
~1180px matters separately because it is the narrowest the copy column gets while the hero
is still two columns.

**German is the long language — design for it, not for English.** It has already forced a
shorter hero eyebrow and secondary CTA, the header gaps (the row needed 1164px in a 1160px
box, pushing the language switcher off screen at _every_ width), the hero stats card going
one-column on phones, and the trust row stacking its icon above its label. Check German
first; English and Slovak then fit comfortably.

## Current state

**Done:** project setup, i18n foundation, the component library, and the Home and About
pages fully ported and refined.

- **i18n** — de-AT default at `/`, English at `/en/`, Slovak at `/sk/`, with per-language
  slugs (`/leistungen/`, `/en/services/`, `/sk/sluzby/`) from the registry in
  `src/i18n/routes.ts`. Reciprocal, self-referencing, absolute hreflang plus `x-default` on
  German, mirrored into `sitemap-index.xml`. Missing translations fail the build.
- **Component library** — `src/components/` (17 components) plus `src/components/sections/`
  for page sections. `src/content-pages/Styleguide.astro` renders all of it at
  `/styleguide/`, in whichever language you switch to.
- **Home** — `src/content-pages/Home.astro`, six sections: `HomeHero`, `ServicesGrid`,
  `WhyChoose`, `BeforeAfter`, `SubscriptionCta`, `ReviewsCarousel`. `ServicesGrid` takes its
  services as a prop so the Services page can reuse it with a fifth entry.
- **About** — `src/content-pages/About.astro`, five sections: `AboutHero`, `MissionValues`,
  `AboutStory`, `AboutReviews`, `AboutCta`, with `src/styles/components/about.css`.

Home refinements worth not undoing:

- **CLS is 0**, via the size-adjusted fallback fonts described above.
- Hero grid is the design's `1fr 1.08fr` (570px copy / 616px photo at the design width), not
  the theme's fixed 750px photo.
- Hero buttons sit on one row in all three languages at every desktop width.
- German h1 is **"Luxusreinigung für modernes Wohnen"** — two lines from ~1205px up.
- Trust row is **three** items side by side, icon stacked _above_ the label.
  "Insured & Bonded" was removed entirely: the client cannot substantiate it. The stacking
  is not decorative — "Zufriedenheitsgarantie" sets 138px and only fits when the label gets
  the whole track.
- The old "More Than Just a Cleaning Service" section is replaced by the client's
  **"Warum Magic Shine?"** five reasons in a 3 + 2 grid (five across gives 134px tracks in
  the `2fr` column — too narrow).

About refinements worth not undoing:

- **CLS is 0** here too, and no horizontal overflow in any of the three languages at 375,
  480, 720, 820, 960, 1180 or 1400.
- The hero tick list goes **one column at 480px**, not the design's 2x2 all the way down.
  At 375 each label box is 120px and "Zufriedenheitsgarantie" sets 154px, so the German
  labels broke mid-word — `overflow-wrap` breaks without even a hyphen. Two tracks need
  428px of client width. Same measurement and same step as the home hero's trust row.
- **`.ms-band` no longer escapes to `100vw`.** A band is a page-level section and `<main>`
  is already the client width, so the classic `width: 100vw; margin-inline: calc(50% - 50vw)`
  pair only added the scrollbar back: band content sat **7.5px left** of every constrained
  section, at every width where the container is gutter bound. About is the first page to
  use a band; `width: 100%` is the whole rule now. See section.css.
- The design's two booking CTAs became the quote request (hero, closing CTA primary) and
  the contact page (closing CTA secondary) — there is no booking engine to send them to.
- The reviews band reuses `reviews.one`–`three`, and the story figures reuse
  `home.stats.*`: the same three claims the client still has to sign off on live in one
  place, not two.

**Scaffolding to delete before launch:** `Styleguide.astro` with its `ROUTES` entry and the
sitemap filter in `astro.config.mjs`; `Placeholder.astro` once the last real page replaces
it.

## Next

Port the remaining pages one at a time, existing content first:

1. **Services**, **Service Detail**, **Contact** — port from the reference.
   `Placeholder.astro` currently stands in for Services, Pricing, Contact and Quote so every
   nav link resolves.

Then the new content:

2. The **B2B landing page** — a new route, so it needs a `ROUTES` entry and a nav decision.
   The long-form **"Warum Magic Shine?"** paragraphs belong here, not on About: About
   already covers that ground with Mission / Vision / Values, and the long form is aimed at
   the B2B audience. Client's call, 2026-08-22 — do not add it back to About.
3. **"Preise & Ablauf"** — the reframed pricing page.
4. The **quote request form**, replacing the booking wizard.

Then translation review and deploy.

## Pre-launch list

- **Hero stats claims** — "10.000+ gereinigte Zuhause", "4,9 Durchschnittsbewertung",
  "98 % Stammkundschaft" are unsubstantiated, carried over from the design. Awaiting the
  client's decision; **leave as-is for now**. Same class of claim as the insured/bonded line
  that was already removed, and the same UWG exposure if they cannot be backed up.
- **Domain undecided** — .sk vs .at. Vienna is the main market, which argues for .at.
- **`SITE` in `astro.config.mjs` is a placeholder** (`https://www.magicshine.at`). hreflang
  and canonicals are absolute and built from it, so it must be the real production origin
  before launch. One place to change.
- **Business details in `src/data/site.ts` are placeholders** — phone, email, address,
  socials.
- **Newsletter needs a provider.** `SITE_DETAILS.newsletterAction` is `null`; until it is
  set the footer form renders but refuses to submit and says so, rather than reloading and
  dropping the address.
- **The quote form will need a form/email service** — there is no backend.
- **German and Slovak copy needs a native review**, German especially given the B2B audience
  in Vienna. Current copy is the existing site's, authored in English and translated here,
  plus the client's own five reasons — all placeholder until she refines it.
