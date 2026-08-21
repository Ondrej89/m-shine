import { DEFAULT_LOCALE, type Locale } from './config';
import de from './de.json';
import en from './en.json';
import sk from './sk.json';

/**
 * Translation lookup.
 *
 * German is the source dictionary: its shape defines the key set, and the
 * `satisfies` below makes TypeScript fail the build if `en.json` or `sk.json`
 * is missing a key that `de.json` has. That is the whole point of the pattern —
 * a page is written once against `t('home.title')` and a forgotten Slovak
 * string becomes a compile error rather than a German word on a Slovak page.
 */
const dictionaries = { de, en, sk } satisfies Record<Locale, typeof de>;

type Dictionary = typeof de;

/** Dot-separated paths to every string in the dictionary, e.g. `nav.services`. */
type Join<K, P> = K extends string
	? P extends string
		? `${K}${'' extends P ? '' : '.'}${P}`
		: never
	: never;

type Leaves<T> = T extends object ? { [K in keyof T]-?: Join<K, Leaves<T[K]>> }[keyof T] : '';

export type TranslationKey = Leaves<Dictionary>;

function lookup(dict: unknown, key: string): string | undefined {
	const value = key
		.split('.')
		.reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], dict);
	return typeof value === 'string' ? value : undefined;
}

/**
 * Resolve one key in one language.
 *
 * Falls back to German rather than rendering an empty node: a visitor seeing
 * the Austrian wording is a much smaller failure than a hole in the page. The
 * fallback also logs, so a gap cannot pass unnoticed during a build.
 */
export function t(locale: Locale, key: TranslationKey): string {
	const direct = lookup(dictionaries[locale], key);
	if (direct !== undefined) return direct;

	const fallback = lookup(dictionaries[DEFAULT_LOCALE], key);
	console.warn(`[i18n] Missing "${key}" for locale "${locale}" — falling back to ${DEFAULT_LOCALE}.`);
	return fallback ?? key;
}

/**
 * Curried form for templates: `const t = useTranslations(locale)` at the top of
 * a component, then `t('nav.services')` everywhere below.
 */
export function useTranslations(locale: Locale) {
	return (key: TranslationKey): string => t(locale, key);
}

/** Whole sub-tree access, for lists (`nav`, feature bullets, FAQ entries…). */
export function section<K extends keyof Dictionary>(locale: Locale, key: K): Dictionary[K] {
	return dictionaries[locale][key];
}
