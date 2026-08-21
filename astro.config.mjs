// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The canonical origin. hreflang annotations MUST be fully-qualified absolute
// URLs for Google to honour them, so this has to be the real production origin
// before launch — a wrong value here silently breaks the whole de-AT / en / sk
// alternate cluster. Change it in ONE place: here.
const SITE = 'https://www.magicshine.at';

export default defineConfig({
	site: SITE,

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
		}),
	],

	// Every page is a real .html file on disk, so the site drops onto any static
	// host (or GitHub Pages) with directory-style URLs and trailing slashes.
	build: {
		format: 'directory',
	},
	trailingSlash: 'always',
});
