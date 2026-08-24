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
Commercial, Pricing and Quote, plus the i18n foundation, the component library and a
GitHub Pages preview deployment. The catalogue is split into a private and a business
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
- Card photos are `home-svc-{office,practice,hotel,restaurant}.webp`, converted from
  `_design-reference/img/Magic_Shine_*.jpg` to 456x304 webp — the size the four residential
  card photos already used. The chips are new `.ms-card--{office,practice,hotel,restaurant}`
  rules in cards.css, the same glyphs as `Icon.astro`'s `office`/`clinic`/`bed`/`restaurant`
  redrawn as data URIs because the chip is a background image.
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
- **The copy column's 520px floor is a German measurement**, not a guess: "Luxusreinigung
  für modernes Wohnen" sets on two lines at 520px and breaks to three at 500. The design's
  English headline fits its own 497.5px min-content; German does not, so the floor is
  stated rather than inherited.
- **The photo track is 750px where it fits, and shrinks when it cannot.** The design leaves
  it at 750 always, which puts the stats card — 14px past the photo's right edge — off the
  screen below about 1400px; at 1164 the published design shows 18px of it. Rather than
  hide four numbers from every 1280 and 1366 laptop, the track gives way instead and the
  photo keeps its ratio. Above ~1500 nothing binds and it is the design's 750x500 exactly.
  The 612px subtrahend is 520 copy + 54 gap + 14 card overhang + 24 clearance, and the
  clearance is there because `100vw` counts the scrollbar while layout does not.
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
- **No prices.** The design prints "Starting at $120/visit" on every row. Those are USD
  placeholders for a Vienna business and the pricing page is being reframed, so the price
  line is not rendered. `.ms-svc-price` and the markup slot stay ready — see the pre-launch
  list.
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

- **The form has no endpoint and says so.** `SITE_DETAILS.contactAction` is `null`, exactly
  like `newsletterAction`; the form renders, the browser's own constraint validation blocks
  an empty field or a malformed address, and then the inline script stops the submit and
  explains rather than reloading the page and throwing the message away. Filling in
  `contactAction` removes the `data-` hook and the form posts — no other change.
  It deliberately does **not** say "message sent", which would be a lie.
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

Every page is built. What is left is not page work:

1. **Wire the forms.** Contact and Quote both wait on one form/email service;
   `SITE_DETAILS.contactAction` and `quoteAction` are the two slots, and the newsletter is
   a third. See the pre-launch list.
2. **Native review of the German and Slovak copy**, and the client's decisions on the
   pre-launch list below.
3. **Delete the styleguide**, set the real origin, and deploy.

## Pre-launch list

- **Service prices are the design's USD figures relabelled in euro** — 120/110/150/180 —
  and shown as "ab 120 €" rather than a firm number, per the client. They are still
  unconfirmed amounts and now appear in **two** places — the service detail heroes and the
  Pricing page — both reading the same `services.<key>.price`, one string each. The
  Services *rows* still show no price at all; decide whether they should match.
- **"Haustiersicher" / "pet-safe"** is on every detail page's facts card, from the design.
  It is a product-safety claim the client has not substantiated — the same class as the
  insured/bonded line that was removed. Confirm or drop it.
- **No service galleries.** The design reserves four photos per service and the reference
  has none. The section is not rendered; it needs 16 photos (four services) to come back.
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
- **The contact and quote forms need a form/email service** — there is no backend.
  `SITE_DETAILS.contactAction` and the quote form's equivalent both stay `null` until one
  is chosen; the contact form already renders, validates and declines to submit.
- **Payment answer on Contact is deliberately vague** ("you receive an invoice after the
  visit; we agree the method when you enquire"). The design promised card payment and SEPA
  direct debit, which the client has not confirmed and which no backend supports. Replace
  with the real terms.
- **German and Slovak copy needs a native review**, German especially given the B2B audience
  in Vienna. Current copy is the existing site's, authored in English and translated here,
  plus the client's own five reasons — all placeholder until she refines it.
