/**
 * Facts about the business that are the same in every language — a phone
 * number is not a translatable string, and putting it in the locale JSON files
 * would mean three places to change it and three chances to get it wrong.
 *
 * PLACEHOLDERS: everything here is carried over from the design reference and
 * must be replaced with the real details before launch.
 */
export const SITE_DETAILS = {
	/** Display form, formatted the way it should be read. */
	phone: '+43 1 234 5678',
	/** `tel:` form — no spaces, full international prefix. */
	phoneHref: '+4312345678',
	email: 'office@magicshine.at',
	address: {
		street: 'Musterstraße 1',
		postcode: '1010',
		city: 'Wien',
		country: 'AT',
	},
	socials: [
		{ name: 'Facebook', icon: 'facebook', href: '#' },
		{ name: 'Instagram', icon: 'instagram', href: '#' },
		{ name: 'Google', icon: 'google', href: '#' },
	],
	/**
	 * Where the newsletter form posts. `null` until a provider is chosen — the
	 * footer renders the field either way, but with no endpoint it refuses to
	 * submit and says so rather than reloading the page and losing the address.
	 */
	newsletterAction: null as string | null,
} as const;

/** The five services the footer links to, as route + translation key pairs. */
export const SERVICE_KEYS = ['house', 'apartment', 'move', 'housekeeping', 'deep'] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];
