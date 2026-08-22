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
	about: { de: 'ueber-uns', en: 'about-us', sk: 'o-nas' },
	services: { de: 'leistungen', en: 'services', sk: 'sluzby' },

	/*
	 * The service detail pages. One entry each rather than a parametrised
	 * route: the slug has to differ per language anyway, which is exactly what
	 * this registry stores, and a route id per service keeps `localizedPath`
	 * and the hreflang set working untouched. The slugs nest under the
	 * Services slug in every language, so the URL reads as the breadcrumb
	 * does — `/leistungen/hausreinigung/`. `src/data/services.ts` maps each
	 * one to its content.
	 */
	serviceHouse: {
		de: 'leistungen/hausreinigung',
		en: 'services/house-cleaning',
		sk: 'sluzby/upratovanie-domov',
	},
	serviceApartment: {
		de: 'leistungen/wohnungsreinigung',
		en: 'services/apartment-cleaning',
		sk: 'sluzby/upratovanie-bytov',
	},
	serviceMove: {
		de: 'leistungen/umzugsreinigung',
		en: 'services/move-in-move-out',
		sk: 'sluzby/upratovanie-po-stahovani',
	},
	serviceDeep: {
		de: 'leistungen/grundreinigung',
		en: 'services/deep-cleaning',
		sk: 'sluzby/generalne-upratovanie',
	},
	/*
	 * The business half of the catalogue. `services` above is the private/
	 * residential half — the two are separate pages with separate audiences,
	 * and both sit in the nav. The slug is a customer type rather than a
	 * service name because that is what the page sells.
	 */
	commercial: { de: 'geschaeftskunden', en: 'commercial', sk: 'firmy' },
	pricing: { de: 'preise', en: 'pricing', sk: 'cennik' },
	contact: { de: 'kontakt', en: 'contact', sk: 'kontakt' },
	quote: { de: 'angebot-anfordern', en: 'request-a-quote', sk: 'vyziadat-ponuku' },

	/** Not navigation — the component library, for review. Removed before launch. */
	styleguide: { de: 'styleguide', en: 'styleguide', sk: 'styleguide' },
} as const satisfies Record<string, Record<Locale, string>>;

/** The pages that appear in the header and footer navigation, in order. */
export const NAV_ROUTES = [
	'home',
	'about',
	'services',
	'commercial',
	'pricing',
	'contact',
] as const satisfies readonly RouteId[];

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
