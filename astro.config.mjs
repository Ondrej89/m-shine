// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/*
 * The canonical origin. hreflang annotations MUST be fully-qualified absolute
 * URLs for Google to honour them, so this has to be the real production origin
 * before launch — a wrong value here silently breaks the whole de-AT / en / sk
 * alternate cluster. Change it in ONE place: here.
 *
 * DOMAIN, decided 2026-08-28: `magicshine.at` is the live site and the value
 * below is already it, so nothing here changes at launch — only DNS does.
 * `magicshine.sk` is bought separately and must be configured at the HOST as a
 * 301 redirect to the .at domain, not served as a second copy of the site.
 * That is deliberate: a mirrored .sk would be duplicate content competing with
 * .at for the same three language URLs, and the Slovak page already lives at
 * `magicshine.at/sk/` inside the hreflang cluster this file generates. The
 * redirect is a hosting task; there is nothing to build for it here, and
 * nothing in this repo should ever emit a magicshine.sk URL.
 */
const SITE = 'https://www.magicshine.at';

/*
 * The GitHub Pages preview builds the same site under a repository subpath —
 * `https://<user>.github.io/<repo>/` — so both the origin and the prefix have
 * to change for that one build. The workflow sets these two variables from the
 * repository it is running in; unset, they fall through to production values
 * and nothing about a local build or a root deployment changes.
 *
 * Astro rewrites the assets it emits and, through Vite, `url()` references to
 * `public/` inside CSS. It does NOT rewrite absolute paths written as strings
 * in markup — links, <img src>, font preloads, the favicon. Those go through
 * `withBase()` in src/lib/paths.ts.
 */
const PAGES_SITE = process.env.PAGES_SITE;
const PAGES_BASE = process.env.PAGES_BASE;

export default defineConfig({
	site: PAGES_SITE || SITE,
	base: PAGES_BASE || '/',

	i18n: {
		// German is the primary market (Vienna), so it is the default locale and
		// is served from the root — `/`, not `/de/`. English and Slovak are
		// prefixed. See src/i18n/config.ts for the de -> de-AT hreflang mapping.
		defaultLocale: 'de',
		locales: ['de', 'en', 'sk'],
		routing: {
			prefixDefaultLocale: false,
		},
	},

	integrations: [
		// Emits sitemap-index.xml with xhtml:link alternates per URL, so the same
		// de-AT / en / sk cluster the <head> declares is also declared in the
		// sitemap. `defaultLocale: 'de'` here must stay in step with i18n above.
		sitemap({
			i18n: {
				defaultLocale: 'de',
				locales: { de: 'de-AT', en: 'en', sk: 'sk' },
			},
			// The styleguide is an internal review tool, not a page of the site.
			// It goes away before launch; until then, keep it out of the index.
			filter: (page) => !page.includes('/styleguide/'),
		}),
	],

	// Every page is a real .html file on disk, so the site drops onto any static
	// host (or GitHub Pages) with directory-style URLs and trailing slashes.
	build: {
		format: 'directory',
	},
	trailingSlash: 'always',

	vite: {
		build: {
			/*
			 * Without this the CSS minifier decided every target supported the
			 * media-query RANGE syntax and rewrote `(max-width: 720px)` to
			 * `(width <= 720px)`. That parses as nothing on Safari below 16.4, so
			 * an iOS 16.0–16.3 phone would have silently received the desktop
			 * layout — every breakpoint in the design gone at once.
			 *
			 * Safari 15 is the floor because `mask-composite: intersect`, which
			 * the signature photo fade depends on, needs 15.4 anyway (older
			 * WebKit gets the `-webkit-mask-composite: source-in` line beside it).
			 */
			cssTarget: ['chrome100', 'edge100', 'firefox100', 'safari15'],
		},
	},
});
