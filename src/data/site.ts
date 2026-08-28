/**
 * Facts about the business that are the same in every language — a phone
 * number is not a translatable string, and putting it in the locale JSON files
 * would mean three places to change it and three chances to get it wrong.
 *
 * These are the client's real details (2026-08-28), with two exceptions marked
 * TEMPORARY below: the mailbox and the (absent) social accounts.
 */
export const SITE_DETAILS = {
	/** Display form, formatted the way it should be read. Austria, primary. */
	phone: '+43 681 8160 9657',
	/** `tel:` form — no spaces, full international prefix. */
	phoneHref: '+4368181609657',
	/**
	 * Slovakia, secondary. Shown after the primary wherever both fit; the
	 * header shows the Austrian number alone, because the chrome has no room
	 * for two and Vienna is the market.
	 */
	phoneSecondary: '+421 918 845 731',
	phoneSecondaryHref: '+421918845731',
	/**
	 * TEMPORARY — a personal Gmail mailbox, used because the business has no
	 * domain yet. Every mailto: on the site and every form's destination point
	 * here. SWAP THIS for the real domain mailbox (e.g. office@magicshine.at)
	 * once the domain is live; it is the only place the address is written.
	 */
	email: 'magicshine2601@gmail.com',
	/**
	 * No street-level address is published — the business is run from home and
	 * receives no visitors, so only the city is shown. The Impressum carries
	 * the legally required details separately; see `LEGAL_DETAILS` below.
	 */
	address: {
		city: 'Wien',
		country: 'AT',
	},
	/**
	 * TEMPORARY — empty on purpose. No Facebook, Instagram or Google Business
	 * account exists yet (the client is creating them before launch), and an
	 * icon linking to `#` is worse than no icon. The footer and the contact
	 * page both skip the whole block while this list is empty, so RE-ENABLING
	 * IS ONE EDIT: add the real profile URLs here and both come back.
	 */
	socials: [] as readonly { name: string; icon: string; href: string }[],
	/**
	 * Where the newsletter form posts. `null` until a provider is chosen — the
	 * footer renders the field either way, but with no endpoint it refuses to
	 * submit and says so rather than reloading the page and losing the address.
	 */
	newsletterAction: null as string | null,
	/**
	 * Where the contact form posts. `null` until a form/email service is chosen
	 * — same arrangement as the newsletter above, and for the same reason: the
	 * field renders and validates either way, but with no endpoint the form
	 * refuses to submit and says so rather than reloading the page and throwing
	 * the message away.
	 */
	contactAction: null as string | null,
	/**
	 * Where the quote request form posts. `null` until the same form/email
	 * service is chosen — the form renders and validates either way, and shows a
	 * success panel that says plainly that nothing has been transmitted yet.
	 */
	quoteAction: null as string | null,
	/**
	 * Who the two forms above must deliver to once a service is wired up.
	 * Recorded here rather than in the service's dashboard alone so the
	 * requirement is visible in the codebase — it is `email` today, and it
	 * should follow `email` to the real domain mailbox when that exists.
	 */
	formRecipient: 'magicshine2601@gmail.com',
} as const;

/**
 * The legally required operator details, for the Impressum (§ 5 ECG, § 25
 * MedienG) and the two documents beside it.
 *
 * Deliberately separate from `SITE_DETAILS`: "Magic Shine" is the brand and
 * appears everywhere on the site, but the party legally responsible for it is a
 * named natural person, and an Impressum that says only "Magic Shine" does not
 * satisfy the disclosure requirement. Nothing outside the legal pages reads
 * this object.
 */
export const LEGAL_DETAILS = {
	/** The natural person behind the business — the responsible party. */
	owner: 'Sanela Krinic',
	/** How the operator is named in full on the legal pages. */
	operator: 'Sanela Krinic, trading as Magic Shine',
	/** Einzelunternehmen / SZČO — a sole trader, not a company. */
	registrationNumber: '53 512 391',
	/** UID / VAT identification number. */
	vatId: '3120796745',
	/** Bookkeeping, named on the Impressum as the administrative contact. */
	accountant: {
		name: 'Martina Tanackovic',
		firm: 'RPC SK, s.r.o.',
	},
	/**
	 * The date the templates below were drafted, shown as "last updated".
	 * Bump it whenever the wording changes.
	 */
	lastUpdated: '2026-08-28',
} as const;

/**
 * The footer's service list used to live here, as a second copy of the
 * catalogue that happened to carry Housekeeping as well. It is gone: the
 * footer reads `SERVICES` from `src/data/services.ts` like every other place
 * that lists services, so there is one list and it cannot drift.
 */
