import type { RouteId } from '../i18n/routes';

/**
 * The service catalogue — the one list of what Magic Shine sells.
 *
 * Three places read it and they must not drift apart: the home page's card
 * grid, the Services page's rows, and the Service Detail template (both for the
 * page it renders and for the "other services" row at the foot of it).
 *
 * `key` indexes into the `services.*` copy in `src/i18n/*.json`; `route` is the
 * detail page's entry in the route registry. Everything language-dependent
 * lives in the dictionaries, never here.
 *
 * The design carries a fifth service, Housekeeping, and its copy exists under
 * `services.housekeeping` — but neither the Services page nor the detail
 * template draws it, so it is deliberately absent. Adding it means a `ROUTES`
 * entry, a hero photo and the detail copy; the rest follows from this list.
 */
export interface Service {
	/** Copy key: `services.<key>.*`. */
	key: 'house' | 'apartment' | 'move' | 'deep';
	/** The detail page's route id. */
	route: RouteId;
	/** Card photo — the home page's grid. */
	cardImage: string;
	/** Row photo — the Services page. */
	rowImage: string;
	/** Hero photo — the detail page. */
	heroImage: string;
	/** Icon for the "other services" cards; also the card grid's chip. */
	icon: 'house' | 'apartments' | 'box' | 'sparkle';
}

export const SERVICES = [
	{
		key: 'house',
		route: 'serviceHouse',
		cardImage: '/img/photos/home-svc-house.webp',
		rowImage: '/img/photos/srv-house.webp',
		heroImage: '/img/photos/sd-house-hero.webp',
		icon: 'house',
	},
	{
		key: 'apartment',
		route: 'serviceApartment',
		cardImage: '/img/photos/home-svc-apt.webp',
		rowImage: '/img/photos/srv-apt.webp',
		heroImage: '/img/photos/sd-apartment-hero.webp',
		icon: 'apartments',
	},
	{
		key: 'move',
		route: 'serviceMove',
		cardImage: '/img/photos/home-svc-move.webp',
		rowImage: '/img/photos/srv-move.webp',
		/* No `sd-` hero was drawn for these two, so the Services row photo does
		   double duty. Swap in real hero photography when it arrives. */
		heroImage: '/img/photos/srv-move.webp',
		icon: 'box',
	},
	{
		key: 'deep',
		route: 'serviceDeep',
		cardImage: '/img/photos/home-svc-deep.webp',
		rowImage: '/img/photos/srv-deep.webp',
		heroImage: '/img/photos/srv-deep.webp',
		icon: 'sparkle',
	},
] as const satisfies readonly Service[];

/** The service a detail-page route renders, or `undefined` for any other page. */
export function serviceForRoute(route: RouteId): (typeof SERVICES)[number] | undefined {
	return SERVICES.find((service) => service.route === route);
}
