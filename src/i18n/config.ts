/**
 * The single source of truth for which languages exist, what they are called,
 * where they live in the URL, and how they are announced to search engines.
 *
 * Astro's own `i18n` config (astro.config.mjs) knows only the three routing
 * codes `de` / `en` / `sk`. Everything else about a locale — the BCP-47 tag
 * that goes in `lang=` and `hreflang=`, the endonym for the switcher, the
 * OpenGraph locale — lives here.
 *
 * The de -> de-AT distinction is the important one. The routing code stays a
 * bare `de` (short URLs, and it is the default locale so it never appears in a
 * path anyway), but every signal a search engine reads says `de-AT`, because
 * the market is Vienna and Austrian searchers must be served the Austrian page.
 */

export const LOCALES = ['de', 'en', 'sk'] as const;

export type Locale = (typeof LOCALES)[number];

/** German is primary: it is served from `/`, not `/de/`. */
export const DEFAULT_LOCALE: Locale = 'de';

export interface LocaleMeta {
	/** Routing code, and the URL prefix for non-default locales. */
	code: Locale;
	/** BCP-47 tag for `<html lang>`. */
	lang: string;
	/**
	 * hreflang values pointing at this locale's URLs. More than one is allowed
	 * and normal: German gets the region-targeted `de-AT` plus a bare `de`, so
	 * German speakers outside Austria are not excluded from the cluster.
	 */
	hreflang: string[];
	/** OpenGraph `og:locale`, underscore-separated. */
	ogLocale: string;
	/** The language's name *in that language* — never translate these. */
	label: string;
	/** Two-letter code shown in the compact switcher. */
	short: string;
	/** `dir` attribute; all three are LTR, but be explicit rather than assume. */
	dir: 'ltr' | 'rtl';
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
	de: {
		code: 'de',
		lang: 'de-AT',
		hreflang: ['de-AT', 'de'],
		ogLocale: 'de_AT',
		label: 'Deutsch',
		short: 'DE',
		dir: 'ltr',
	},
	en: {
		code: 'en',
		lang: 'en',
		hreflang: ['en'],
		ogLocale: 'en_GB',
		label: 'English',
		short: 'EN',
		dir: 'ltr',
	},
	sk: {
		code: 'sk',
		lang: 'sk',
		hreflang: ['sk'],
		ogLocale: 'sk_SK',
		label: 'Slovenčina',
		short: 'SK',
		dir: 'ltr',
	},
};

/**
 * Narrows an arbitrary string (e.g. `Astro.currentLocale`, which is typed as
 * `string | undefined`) to a `Locale`, falling back to German.
 */
export function asLocale(value: string | undefined): Locale {
	return (LOCALES as readonly string[]).includes(value ?? '')
		? (value as Locale)
		: DEFAULT_LOCALE;
}
