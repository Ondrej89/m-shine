import { DEFAULT_LOCALE, LOCALES, type Locale } from './config';

/**
 * Every page on the site, with its URL slug **per language**.
 *
 * Localised slugs are not decoration: `/leistungen/` is what an Austrian
 * searcher types and what Google indexes for the German cluster, and it would
 * be painful to retrofit once pages exist. Add a page by adding one entry here
 * plus one component in `src/content-pages/` — the router below and the
 * catch-all route generate all three language URLs from it automatically.
 *
 * An empty slug means the locale's root (`/`, `/en/`, `/sk/`).
 */
export const ROUTES = {
	home: { de: '', en: '', sk: '' },

	// Step 2+ will fill these in as their components land:
	// services: { de: 'leistungen',  en: 'services', sk: 'sluzby' },
	// pricing:  { de: 'preise',      en: 'pricing',  sk: 'cennik' },
	// about:    { de: 'ueber-uns',   en: 'about-us', sk: 'o-nas'  },
	// contact:  { de: 'kontakt',     en: 'contact',  sk: 'kontakt' },
	// quote:    { de: 'angebot',     en: 'quote',    sk: 'ponuka' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteId = keyof typeof ROUTES;

export const ROUTE_IDS = Object.keys(ROUTES) as RouteId[];

/**
 * Build the site-root-relative URL for a page in a given language.
 *
 * German is the default locale and carries no prefix, so `home` in German is
 * `/` while English is `/en/`. Always trailing-slashed, matching
 * `trailingSlash: 'always'` in astro.config.mjs.
 */
export function localizedPath(locale: Locale, route: RouteId): string {
	const slug = ROUTES[route][locale];
	const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
	return slug ? `${prefix}/${slug}/` : `${prefix}/`;
}

/** The same URL, fully qualified — required for hreflang and canonical tags. */
export function localizedUrl(locale: Locale, route: RouteId, site: URL | string): string {
	return new URL(localizedPath(locale, route), site).href;
}

/** Every language's version of one page, for hreflang and the switcher. */
export function alternates(route: RouteId) {
	return LOCALES.map((locale) => ({ locale, path: localizedPath(locale, route) }));
}

/**
 * The full path list the catch-all route builds the site from: one entry per
 * (page x language) pair. `path` is `undefined` for German home so that Astro
 * emits `/` rather than `//`.
 */
export function allRoutePaths() {
	return ROUTE_IDS.flatMap((route) =>
		LOCALES.map((locale) => {
			const path = localizedPath(locale, route).replace(/^\/|\/$/g, '');
			return {
				params: { path: path === '' ? undefined : path },
				props: { locale, route },
			};
		}),
	);
}
