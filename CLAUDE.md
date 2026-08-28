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

**Done: every page.** Home, About, Services (residential), Service Detail, Contact,
Commercial, Pricing, Quote and the three legal documents, plus the i18n foundation, the
component library and a GitHub Pages preview deployment. The catalogue is split into a private and a business
half, pricing is reframed as prices + process, and the booking wizard is a quote request.

- **i18n** — de-AT default at `/`, English at `/en/`, Slovak at `/sk/`, with per-language
  slugs (`/leistungen/`, `/en/services/`, `/sk/sluzby/`) from the registry in
  `src/i18n/routes.ts`. Reciprocal, self-referencing, absolute hreflang plus `x-default` on
  German, mirrored into `sitemap-index.xml`. Missing translations fail the build.
- **Component library** — `src/components/` (17 components) plus `src/components/sections/`
  for page sections. `src/content-pages/Styleguide.astro` renders all of it at
  `/styleguide/`, in whichever language you switch to.
- **Home** — `src/content-pages/Home.astro`, six sections: `HomeHero`, `ServicesGrid`,
  `WhyChoose`, `BeforeAfter`, `SubscriptionCta`, `ReviewsCarousel`. `ServicesGrid` sells the
  **commercial** side — see below.
- **About** — `src/content-pages/About.astro`, five sections: `AboutHero`, `MissionValues`,
  `AboutStory`, `AboutReviews`, `AboutCta`, with `src/styles/components/about.css`.
- **Services (private customers)** — `src/content-pages/Services.astro`, four sections:
  `ServicesHero`, `ServiceRows`, `ServicesTrust`, `ServicesCta`, with
  `src/styles/components/services.css`. The whole page is on the **1160px** grid. Nav label
  is **Privatkunden / Residential / Domácnosti**; the slugs stay `/leistungen/` and friends
  because twelve service-detail URLs nest under them.
- **Commercial (business customers)** — `src/content-pages/Commercial.astro`, five
  sections: `CommercialHero`, `CommercialSectors`, `CommercialWhy`, `CommercialPricing`,
  `CommercialCta`, with `src/styles/components/commercial.css`. Also 1160px.
  `/geschaeftskunden/`, `/en/commercial/`, `/sk/firmy/`.
- **Service Detail** — `src/content-pages/ServiceDetail.astro`, **one template, four
  pages**, on the **1200px** grid. Sections: `ServiceDetailHero`, `ServiceOverview`,
  `ServiceReviews`, `OtherServices`, `ServiceDetailCta`, plus the reusable
  `Breadcrumbs.astro`, with `src/styles/components/service-detail.css`.
- **Contact** — `src/content-pages/Contact.astro`, one section (`ContactSection`) on the
  **1180px** grid, with `src/styles/components/contact.css`. FAQs left, contact facts and
  the message form right.
- **Pricing** — `src/content-pages/Pricing.astro`, "Preise & Ablauf" on the **1200px**
  grid: starting prices, the four factors, the recurring-cleaning save bar, three steps, a
  business note and the closing CTA. Sections `PricingStart`, `PricingFactors`,
  `PricingProcess`, `PricingCta`, with `src/styles/components/pricing.css`.
- **Quote** — `src/content-pages/Quote.astro`, the booking wizard refitted: the same
  four-step visual flow, but one form with four numbered cards rather than a stateful
  wizard. `/angebot/`, `/en/quote/`, `/sk/ponuka/`. Section `QuoteForm`, with
  `src/styles/components/quote.css`.
- **Legal** — Impressum, Datenschutzerklärung and AGB, **one template for all three**:
  `src/components/sections/LegalDoc.astro` takes a `doc` prop and a list of block keys, and
  `Imprint.astro` / `Privacy.astro` / `Terms.astro` are three-line pages around it. On the
  **1180px** grid with the reading column capped at 760px inside it, with
  `src/styles/components/legal.css`. `/impressum/`, `/datenschutz/`, `/agb/` and their
  English and Slovak slugs. In `ROUTES` but not `NAV_ROUTES` — the footer's legal bar is
  the only route to them. Every one of them carries a visible "this is a template" notice
  until the accountant signs the wording off.
- **`src/data/services.ts`** — the service catalogue, and the reason none of the above
  repeat themselves. Home's cards, the Services rows, and the detail template (its own
  page *and* its "other services" row) all read this one list. Adding a service is an
  entry here, a `ROUTES` entry and its copy.

Home refinements worth not undoing:

- **CLS is 0**, via the size-adjusted fallback fonts described above.
- **The card grid sells commercial cleaning, not residential** (client's decision,
  2026-08-24). Four cards — Büro-, Ordinations-, Hotel- und Gastronomiereinigung — which are
  the first four sectors of the Commercial page and **read that page's copy**: the title from
  `commercial.sectors.<n>.title` and the one-liner and photo alt from `cardShort` /
  `cardPhotoAlt` beside it, so a sector is named and described once. The keys stay `one`..
  `four` for that reason; the fifth sector (Hausverwaltung) has no card because the grid's
  tracks are `repeat(4, 1fr)`. `ServicesGrid` no longer reads `src/data/services.ts`.
- **Each card asks for a quote** (`nav.quote` -> `localizedPath(locale, 'quote')`), because
  detail pages exist for the private-customer services only. The button under the grid still
  goes to the residential Services page — confirmed deliberate, it is the home page's one
  route through to the private-customer side. Do not "fix" it to point at the Commercial
  page; `services.viewAll` says so out loud now ("Privatkunden-Leistungen ansehen" / "View
  Our Residential Services" / "Zobraziť služby pre domácnosti") so a commercial row above a
  residential button does not read as a mistake. The German is the compound rather than the
  better-reading "Leistungen für Privatkunden ansehen" because that one needs 350px and the
  button has 343 at 375px — it wrapped. All three set on one line from 360px up.
- **The card bottom-aligns its link.** `.ms-card` is a flex column and `.ms-card__body`
  takes the slack, so every "Angebot anfordern" sits on the card's bottom edge whatever the
  copy above it does. Without it the home row's links stood 22px apart at 1400 and 23px at
  1180 — the commercial one-liners run two lines or three where the residential ones ran one
  or two, which is why the theme never needed this. `.ms-learn` gets `align-self: flex-start`
  so it keeps its own width rather than stretching to a card-wide hit area.
- Card photos are `home-svc-{office,practice,hotel,restaurant}.webp` at 456x304 — the size
  the four residential card photos already used. They are the client's own branded shots
  (2026-08-25), converted from `_design-reference/img/new/{Office,Medical,Hotel,Restaurant}.jpeg`
  and replacing the first pass off `_design-reference/img/Magic_Shine_*.jpg`. All four
  sources are ~1.5:1, so a centred `fit: 'cover'` crop to 3:2 leaves them essentially
  untouched — that is the conversion to repeat if they are regenerated. (The client
  re-shot Hotel and Medical the same day; the first Medical was 1166x978 and needed
  `position: 'top'` to keep the subject's head in frame. The replacement does not.) The
  chips are `.ms-card--{office,practice,hotel,restaurant}` rules in
  cards.css, the same glyphs as `Icon.astro`'s `office`/`clinic`/`bed`/`restaurant` redrawn
  as data URIs because the chip is a background image.
- **The card `cardPhotoAlt` strings describe these photos**, so they changed with them: all
  four now show a Magic Shine staff member at work, where the old set was empty rooms. They
  are read by `ServicesGrid` only — the Commercial page's sector cards carry no photo — so
  editing them touches the home page alone. They have been rewritten twice for this reason;
  if a photo is swapped, its alt is part of the swap.
- The residential `services.<key>.description` / `.photoAlt` strings are now read **only by
  the styleguide**. They go orphaned when it is deleted; drop them then, not before.
- **Hero grid is `minmax(520px, 1fr)` copy and a 750px photo** — the design's own tracks,
  read off the published build at ondrej89.github.io/MagicShineWeb/Home.dc.html, where the
  grid computes to `497.5px 750px` with a 54px gap and overflows its 1240 container on
  purpose. An earlier pass here used `1fr 1.08fr` to avoid that overflow; it shrank the
  photo to 616px and, against a fixed 500px height, had `object-fit: cover` throw away a
  third of the frame. Do not go back to fractional tracks for the photo.
- **The hero photo is `aspect-ratio: 3 / 2`, never a fixed height.** The source is 1200x800,
  so the 750px track gives exactly the design's 500px tall photo with nothing cropped.
  Stated as a ratio so the two cannot drift apart again.
- **The copy column's 520px floor is a German measurement**, not a guess. It was set
  against the headline "Luxusreinigung für modernes Wohnen" (two lines at 520px, three at
  500); the design's English headline fits its own 497.5px min-content and German does not,
  so the floor is stated rather than inherited. It stays with the current, longer headline.
- **The photo track is 750px where it fits, and shrinks when it cannot.** The design leaves
  it at 750 always, which puts the stats card — 14px past the photo's right edge — off the
  screen below about 1400px; at 1164 the published design shows 18px of it. Rather than
  hide four numbers from every 1280 and 1366 laptop, the track gives way instead and the
  photo keeps its ratio. Above ~1500 nothing binds and it is the design's 750x500 exactly.
  The 612px subtrahend is 520 copy + 54 gap + 14 card overhang + 24 clearance, and the
  clearance is there because `100vw` counts the scrollbar while layout does not.
- Hero buttons sit on one row in all three languages at every desktop width.
- German h1 is **"Sauberkeit für Ihr Zuhause und Ihr Unternehmen"** (client, 2026-08-25),
  replacing "Luxusreinigung für modernes Wohnen": the page sells to businesses as well as
  households, and the old line named only the household half. It sets on **three** lines in
  the 520px copy column from 1180px up, two lines between roughly 480 and 1100, three again
  at 375. Measured: no overflow at 375, 480, 720, 960, 1180, 1280, 1366 or 1440 in any of
  the three languages. The third line does push the copy column past the photo's bottom
  edge — by 5px at 1440, 17 at 1366, 38 at 1280 and 68 at 1180 — so the hero's height is
  now set by the copy rather than the photo. That is the trade the longer headline buys and
  it reads as intended; if a future pass wants the photo governing again, the headline is
  what has to get shorter, not the 520px floor. The
  split is `titleLead` "Sauberkeit für" + `titleAccent` "Ihr Zuhause und Ihr Unternehmen",
  keeping the accent on the whole object as the design's does.
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
- The reviews band reuses `reviews.one`–`three`. It used to share the home hero's three
  statistics as well, through `home.stats.*`; those were the design's invented numbers and
  the client removed them, and sharing one set of strings is what made them leave both
  pages at once. The story now closes on its second paragraph — see AboutStory.astro.

Services refinements worth not undoing:

- **CLS is 0** in all three languages, and no overflow — outer or inside any track — at
  375, 480, 600, 720, 820, 960, 1180 or 1400.
- The trust row is **three** items, not the design's four: "Insured & Bonded" is gone here
  too. Its strings are the home hero's `home.trust.*` rather than a second copy of the same
  three claims.
- That row **stacks its icon above its label at 820px**, which is not in the design or the
  theme. "Zufriedenheitsgarantie" is a single unbreakable 153px word; beside a 46px icon an
  item needs 212px, and three across only clear that above ~765px. The theme's answer (two
  columns at 600, capped at 420px) gives 141px of label box and the word hung 13px past the
  viewport at 375, swallowed by `overflow-x: hidden`. Stacking hands the label the whole
  track — the home hero's fix, for the identical reason.
- The tick lists go one column at 480 — the design's own step, which the theme dropped.
  Nothing breaks without it; it buys one line per tick instead of two.
- **The rows show a starting price again** (2026-08-28). The line was suppressed while
  the only figures were the design's USD placeholders relabelled in euro; the client's real
  hourly rates replaced them, so `.ms-svc-price` renders and the foot is back to the
  design's arrangement — price at the start, the two buttons at the end. It reads the same
  `services.<key>.price` as the Pricing page and the detail hero. The price is an
  `inline-flex` with a `gap`, not three inline children: Astro collapses the whitespace
  between `{t(...)}` and `<b>` across source lines and it rendered "ab30 €pro Stunde".
- **No "Read More" and no linked row titles.** Both pointed at Service Detail, which has no
  route yet. When it lands, give each entry in `ServiceRows` a route id and restore them;
  `.ms-svc-row__title a` styling is already there.
- `services.housekeeping` (Haushaltsbetreuung) has copy and a footer link but **no row** —
  the design draws four. `_design-reference/slots/srv-house2.webp` is unused and would suit
  a fifth. Client's call.

Service Detail refinements worth not undoing:

- **Four routes, one component.** `ROUTES` has an entry per service with a slug nested
  under the Services slug in each language (`/leistungen/hausreinigung/`,
  `/en/services/house-cleaning/`), and `serviceForRoute()` turns the route back into a
  catalogue entry. `localizedPath`, the hreflang set and the sitemap needed no changes —
  a multi-segment slug already worked.
- **`nameInline`** is a second name per service, for the running-text CTA. Without it
  English read "Ready for your Move In / Move Out?" and Slovak capitalised a common noun
  mid-sentence. German is unchanged (it capitalises nouns anyway). The design carries the
  same pair, as `nameLower`.
- The reviews heading and the CTA interpolate `{service}` with a one-token `.replace()`.
  `t()` has no interpolation and does not need any — this is the only sentence on the site
  that varies, and a placeholder keeps the whole clause, word order included, in the
  translator's hands.
- **The eyebrow is the category, not the service name.** The design puts the same string
  in the eyebrow and the h1 ("HAUSREINIGUNG" over "Hausreinigung"), which reads as a
  mistake; it uses `services.hero.eyebrow`, which already existed.
- **No gallery.** The design's four-cell gallery between the overview and the reviews is
  an empty slot — there is no photography for it in the reference, and four grey boxes are
  worse than no section. See the pre-launch list.
- Move In / Move Out and Deep Cleaning have **no `sd-` hero photo** in the reference, so
  they reuse their Services row photo. Real hero photography is a `heroImage` change each.
- Services rows and the home cards now link to these pages — the two deferred links from
  the Services port.

Contact refinements worth not undoing:

- **The form posts to Web3Forms** and has three states — sent, failed, and not-yet-keyed.
  See "Forms" below; the failure state is the one worth not undoing, because it keeps every
  value the visitor typed.
- **The FAQ accordion is `<details>`/`<summary>`**, not the design's scripted state. The
  browser supplies the toggle, the keyboard behaviour and the expanded state, and the
  answers stay findable by in-page search. Nothing ships.
- **The page has an `<h1>`** — the contact-column heading. The design draws both column
  headings at the same size and gives the page no title, which would leave it with no h1 at
  all. It is the second heading in source order; that is the lesser problem.
- **`body` is a flex column and `.ms-main` takes the slack** (base.css). Contact is the one
  page that can come out shorter than the screen — at 1024x1366 it rendered 1333px and the
  last 33px showed the page background below the footer. The theme scopes the same fix to
  Contact with a body class because WordPress buries the page in an unselectable wrapper;
  here it is one rule for every page, and the Placeholder pages need it too.
- Business hours live in `contact.hoursWeek` / `hoursWeekend` per language, not in
  `site.ts`: the day names are translatable, the rest of the business facts are not.

Commercial page notes worth not undoing:

- **It is not a variant of the Services page** and must not be merged back into one. The
  old "Commercial & Specialized" section is gone from Services; its card CSS moved to
  `commercial.css`, where the cards now carry a paragraph and three specifics each and sit
  three across instead of five.
- Almost no new CSS: the hero reuses `.ms-svc-hero*`, the pricing factors reuse
  `<FeatureCard>` and `.ms-feat-row`, the closing band reuses `.ms-sd-cta*`. What is new is
  the sector-card block, the long-form reading column and the quote-turnaround note.
- `.ms-feat-row` goes **one column at 600px on this page only**. Its 2x2-to-375 behaviour
  is right for the home page's one-line features and documented in cards.css; these three
  factors carry a two-sentence paragraph each, which at 375 meant a 149px column running
  ten lines deep.
- The **long-form "Warum Magic Shine?"** lives here, in the same five reasons and the same
  order as the home page's short version, so the two never disagree. Client approved the
  drafted German as final on 2026-08-23.
- **The header lost its phone block to make room.** Six German nav items needed 118px more
  than the 1160px chrome box while it showed, and that box does not grow with the viewport.
  The nav gap went 26 -> 20 and the burger step 900 -> 1000 as well; German now has 64px of
  slack at full width and 33px at 1001px. Client approved keeping the full-length labels
  over keeping the phone. See the long note in header.css.

Pricing page notes worth not undoing:

- **No plan tiers.** The design sells three fixed plans with a radio selector; the business
  does not work that way, so the page explains where prices start, what moves them and how
  a firm quote is reached. The theme's `.ms-plan-*` block is deliberately not ported. Its
  hero and its save bar are — the save bar was already about recurring cleaning.
- **The prices are the service detail pages' own strings** (`services.<key>.price` with the
  shared label and unit), so the two pages cannot drift and the client edits one figure in
  one place. They are still the unconfirmed euro placeholders.
- **The frequency discount carries no percentage.** None has been agreed; the concept is
  the promise and the number belongs in the client's own quote.
- The step numbers are a CSS counter on the list, so the markup holds no digits and
  reordering renumbers them.

Quote page notes worth not undoing:

- **It is a real wizard: one step on screen, Next/Back between them.** The client asked for
  the booking wizard's step-by-step feel specifically, after a first pass built it as one
  long form. Do not flatten it again.
- **Match the booking design's chrome, which a first attempt did not.** 48px circles with
  the number inside, the label centred *underneath*, and the rule running the whole way
  across the gap between two circles — not small circles with the label beside them and a
  12px stub. Each stepper item is an equal flex track, which is what lets the rule be
  positioned from one circle's edge to the next regardless of label length.
- **The step title is a `<legend>`, and a legend renders on the fieldset's border by
  default** — which put it above the card, outside it, indented. It is floated full width
  to drop it back into the content flow, and the card is a `flow-root` so it still contains
  it. Anything following the title needs `clear: both`.
- **The action row lives inside the step card**, under a divider, as the design draws it.
  There is one row and the script moves it into whichever step is on screen; that keeps its
  listeners and avoids repeating the markup per step.
- **Three stepper states, from the client's reference:** a finished step turns green and
  swaps its number for a tick, with the rule leaving it green too; the current step is blue
  with its number; anything ahead is grey. The tick is `content` on the pseudo-element that
  already draws the circle — no per-state markup.
- The size/room/bathroom/bedroom fields and the business floor-area, rooms-and-floors and
  cleans-per-week fields carry **example placeholders** ("z. B. 85"), not default values. A
  real default would be submitted as though the person had typed it, and a quote would be
  built on a number nobody chose.
- **It degrades.** The markup renders every step open with the nav hidden; the script hides
  all but the current step and reveals the nav. Without JavaScript the page is the long
  form, which still submits. CLS is 0 because that happens before first paint.
- **Values survive stepping for free** — the whole thing is one `<form>` and stepping only
  toggles `hidden`. There is no state to serialise.
- **The branch switch disables the inactive half's `<fieldset>` and resets its fields**, so
  a business enquiry cannot carry private fields or the reverse. Verified by reading
  `FormData`: a private submission has no `businessSize`, a business one has no `pets`.
  `disabled` also takes those fields out of validation, which is what stops a hidden
  required field blocking submit. The `:has()` rule in quote.css does the hiding for the
  no-JavaScript case.
- **Next validates only the current step.** `form.reportValidity()` would flag a field
  three steps ahead, which reads as the wizard refusing to advance for no visible reason.
- **The success panel is honest.** It appears on submit as the client asked, and says
  plainly that the form is not connected yet and nothing was transmitted, with the phone
  and mailbox beside it. When the endpoint lands, swap `quote.successBody` for a real
  confirmation.
- The stepper's items use `data-stepper-step`, the form's fieldsets `data-step`. They are
  different attributes on purpose: a document-wide query for `[data-step]` would otherwise
  return both.
- **Every "Angebot anfordern" on the site ends here** — 31 of them on the German pages
  alone, all through `localizedPath(locale, 'quote')`, so the slug change from
  `/angebot-anfordern/` to `/angebot/` was one line in the registry.

Forms:

- **Web3Forms, not Formspree.** 250 submissions a month on the free tier rather than 50,
  and the access key is issued straight to a mailbox with no dashboard account to create
  and no password for anyone to keep. There is no server of ours in the path, which is the
  whole requirement — this is a static site.
- **The access key is public by design** and ships in the HTML of every page with a form.
  That is how the service works: the key authorises delivery to one fixed mailbox and
  nothing else. It lives in the source rather than in an environment variable because it is
  not a secret and because GitHub Pages builds have no env to read one from.
- **`null` is a working state, not a broken one.** With no key, `contactAction` and
  `quoteAction` are `null`, both forms take the "not connected yet" path, and **nothing is
  posted anywhere** — verified. That guard is what lets the wiring ship before the key
  does; do not delete it when the key lands, because it is also what protects a rebuild
  with the key accidentally removed.
- **Three states, and the failure state is the point.** Sent replaces the form with a
  success panel; failed leaves **every value the visitor typed exactly where it was**, puts
  an error under the button, and repeats the phone and mailbox. Four steps of quote answers
  or a paragraph of message must survive a bad minute at a third-party API. The one thing
  never to do here is clear the form on error.
- **A 200 is not a success.** Web3Forms answers 200 with `{ success: false }` for a
  submission it rejects — a bad key, a tripped spam rule — so both scripts check the JSON
  body, not the status code.
- **`FormData` as the fetch body, not JSON.** It is a CORS-simple request, so there is no
  preflight to fail, and it picks up the hidden fields the no-JavaScript POST already
  carries rather than restating them in script.
- **The hidden fields sit outside every `<fieldset data-step>` on the quote form.** The
  branch switch disables whole fieldsets, and a disabled `access_key` would arrive empty.
- **The success panel promises no confirmation email**, in all three languages, because
  Web3Forms mails the client and not the visitor. It gives the phone number instead.
- **Honeypot, not a CAPTCHA.** A `display:none` `botcheck` checkbox, out of the tab order
  and out of the accessibility tree; Web3Forms discards anything that arrives with it set.
- **Without JavaScript both forms still send** — a plain POST to the same endpoint, landing
  on Web3Forms' own confirmation page. Not pretty, but not lost.
- **The newsletter is deliberately NOT wired to it.** A newsletter is a subscriber list,
  not a message; routing sign-ups into an inbox would give the client a pile of addresses
  to manage by hand and no way to send to them. It waits for a real provider.

Deployment:

- **GitHub Pages preview** via `.github/workflows/pages.yml` — see README.md for the
  one-time repository setting and how the base path is derived.
- **`withBase()` in `src/lib/paths.ts` is not optional.** Astro rewrites its own assets and
  Vite rewrites `url()` in CSS, but a `/img/...` or `/fonts/...` written as a string in
  markup is left alone and 404s under the Pages subpath. Links go through `localizedPath`,
  which already calls it.

**Scaffolding to delete before launch:** `Styleguide.astro` with its `ROUTES` entry and the
sitemap filter in `astro.config.mjs`. `Placeholder.astro` is already gone — the quote page
was the last route it stood in for.

## Next

Every page is built and the client's real content landed on 2026-08-28 (see "Client content,
2026-08-28" below). What is left is not page work:

1. **Paste the Web3Forms access key.** Contact and Quote are wired and tested; the one
   thing missing is the key, which is a single `null` in `src/data/site.ts`. The newsletter
   is deliberately still waiting on a real provider. See "Forms" below.
2. **Get the three legal pages reviewed.** They are competent generic templates and say so
   on the page, in an amber notice, in all three languages. They are not signed off.
3. **Replace the reviews.** Every testimonial on the site is invented — see the block
   comment at the top of `ReviewsCarousel`, `AboutReviews` and `ServiceReviews`.
4. **Native review of the German and Slovak copy**, and the client's remaining decisions on
   the pre-launch list below.
5. **Delete the styleguide** and deploy. The origin is already right; only DNS changes.

## Client content, 2026-08-28

The client supplied real business details, a pricing model and two decisions that removed
copy. What each one changed, so none of it gets quietly undone:

- **Prices are HOURLY, not per visit.** 30/30/40/40 € an hour for house, apartment, move
  and deep cleaning, replacing the design's 120/110/150/180 per visit. This is a model
  change, not a number change: `services.detailPage.priceUnit` went from "pro Termin" to
  "pro Stunde" and every sentence that promised a per-visit figure was rewritten with it
  (`pricing.heroLede`, `pricing.startLede`). The figure now appears in **three** places —
  the Services rows, the service detail heroes and the Pricing cards — all reading one
  `services.<key>.price` string each.
- **The Services rows show a price again.** They were suppressed while the only figures
  were USD placeholders relabelled in euro; with real rates the design's own foot layout
  (price at the start, actions at the end) is back and `.ms-svc-price` is live.
- **A flat rate is available on request.** `services.detailPage.priceFlat` — "Auch als
  Pauschalpreis möglich, je nach Bedarf." It renders under the Pricing cards and under the
  detail hero's rate, so the offer appears wherever a price does.
- **The recurring discount keeps its no-percentage copy.** Confirmed as real for weekly and
  fortnightly, but priced per client, so `pricing.saveText` is still accurate as written.
- **The home hero's three statistics are gone.** "10.000+ gereinigte Zuhause", "4,9
  Durchschnittsbewertung" and "98 % Stammkundschaft" were invented by the design and are
  removed, not replaced. Because the About story read the same three strings, they went
  from both pages at once — which is what sharing them was for — and the story's figure
  strip and its CSS went with them. What is left in the hero card is "100 %
  Zufriedenheit" plus the two facts the client did confirm: **Wien & Umgebung** and
  **Mo – Fr, 8 – 18 Uhr**. That was a judgment call: one row on a card sized for four looks
  broken, the two additions are real rather than invented, and the service area had nowhere
  else to live on the home page. The strip is `repeat(3, 1fr)` below 1100px now.
- **Two more B2B sectors**, Stiegenhausreinigung and Fensterreinigung, appended as
  `commercial.sectors.six` and `.seven`. Appended rather than inserted because the home
  page's card grid reads `one`..`four` positionally. Two glyphs (`stairs`, `window`) were
  drawn for them in `Icon.astro`. Seven cards sit 3 + 3 + 1; five already sat 3 + 2.
- **Social icons are hidden, not deleted.** `SITE_DETAILS.socials` is an empty array
  because no account exists yet. The footer and the contact page both skip the whole block
  while it is empty, so adding the real profile URLs is the one edit that brings them back.
- **Two phone numbers.** `+43 681 8160 9657` (Austria, primary) and `+421 918 845 731`
  (Slovakia). The contact page lists both; the header shows the Austrian one alone, because
  the chrome has no room for two — see the long note in header.css about that 1160px box.
- **No street address.** `SITE_DETAILS.address` is city-only and the contact page says
  plainly that there is no customer traffic at the location. The Impressum carries the
  details the law asks for.
- **The domain is decided.** `magicshine.at` is the live site, and `SITE` in
  `astro.config.mjs` is already that value, so nothing in this repo changes at launch.
  `magicshine.sk` is bought separately and must be a **301 redirect** configured at the
  host — never a second copy of the site. Slovak already lives at `magicshine.at/sk/`
  inside the hreflang cluster; mirroring it on .sk would be duplicate content competing
  with the .at pages. Nothing here should ever emit a magicshine.sk URL.
- **Three legal pages exist.** `/impressum/`, `/datenschutz/`, `/agb/` and their English
  and Slovak slugs, one `LegalDoc.astro` template for all three, driven by a `doc` prop and
  a list of block keys. They are in `ROUTES` but not `NAV_ROUTES` — the footer's legal bar
  links them, and those three links were `href="#"` until now. `LEGAL_DETAILS` in
  `src/data/site.ts` holds the operator's details and is deliberately separate from
  `SITE_DETAILS`: the Impressum has to name **Sanela Krinic**, a natural person, where the
  rest of the site says "Magic Shine".
- **The B2B page needed no other changes.** The client confirmed the sector descriptions,
  the 24–48h quote turnaround and the site-visit-for-business-premises flow all match what
  she actually does, which is what was already built.

## Pre-launch list

- **"Haustiersicher" / "pet-safe"** is on every detail page's facts card, from the design.
  It is a product-safety claim the client has not substantiated — the same class as the
  insured/bonded line that was removed. Confirm or drop it.
- **No service galleries.** The design reserves four photos per service and the reference
  has none. The section is not rendered; it needs 16 photos (four services) to come back.
- **THE REVIEWS ARE FAKE.** Every quote, name and role on the home page, the About page
  and the four service detail pages came from the design reference and is invented. No real
  review exists yet; the Google Business Profile is still being set up. They are left in
  place only because there is nothing to swap in, and each of the three components carries
  a loud block comment saying so. **The site must not go live with them.**
- **The email address is temporary.** `SITE_DETAILS.email` is a personal Gmail mailbox
  because there is no domain mailbox yet. It is the only place the address is written, and
  every `mailto:` and the Impressum read it. Swap it when the domain is live.
- **The three legal pages are templates, not advice.** Impressum, Datenschutz and AGB are
  standard Austrian small-business wording and carry an amber notice on the page saying so
  in the visitor's language. The accountant has to review and sign them off, and three
  specific gaps are named in the text itself: the hosting provider, the form service and
  the newsletter provider. The Impressum also flags the cross-border question — the
  business is a Slovak sole trader (SZČO, IČO 53 512 391) operating in Vienna, so whether
  an Austrian trade registration or VAT registration is additionally required is the
  accountant's call, not a template's. Remove the notice when it is signed off, and set
  `LEGAL_DETAILS.lastUpdated` to the date of the reviewed version.
- **Newsletter needs a provider.** `SITE_DETAILS.newsletterAction` is `null`; until it is
  set the footer form renders but refuses to submit and says so, rather than reloading and
  dropping the address.
- **The contact and quote forms need their Web3Forms access key.** Everything else is
  built and tested. Until `WEB3FORMS_ACCESS_KEY` in `src/data/site.ts` stops being `null`,
  both forms render, validate, and decline to submit with an honest notice — and post
  nothing anywhere. Get the key by entering `magicshine2601@gmail.com` at web3forms.com;
  it arrives in that mailbox. **Nobody has yet confirmed a real mail arriving**, because
  that needs the key and access to the inbox — do that first thing after pasting it.
- **Payment answer on Contact is deliberately vague** ("you receive an invoice after the
  visit; we agree the method when you enquire"). The design promised card payment and SEPA
  direct debit, which the client has not confirmed and which no backend supports. Replace
  with the real terms.
- **German and Slovak copy needs a native review**, German especially given the B2B audience
  in Vienna. Current copy is the existing site's, authored in English and translated here,
  plus the client's own five reasons — all placeholder until she refines it.
