/**
 * Facts about the business that are the same in every language — a phone
 * number is not a translatable string, and putting it in the locale JSON files
 * would mean three places to change it and three chances to get it wrong.
 *
 * These are the client's real details (2026-08-28), with two exceptions marked
 * TEMPORARY below: the mailbox and the (absent) social accounts.
 */
/**
 * The form backend: Web3Forms (https://web3forms.com).
 *
 * Chosen over Formspree because the free tier is 250 submissions a month
 * rather than 50, and because the access key is issued straight to a mailbox
 * with no dashboard account to create and no password to keep.
 *
 * How it works: the browser POSTs the form to `WEB3FORMS_ENDPOINT` with a
 * hidden `access_key`, and Web3Forms emails the contents to whichever address
 * that key was issued for. There is no server of ours in the path, which is
 * the point — this is a static site.
 *
 * THE ACCESS KEY IS PUBLIC BY DESIGN. It ships in the HTML of every page that
 * carries a form, exactly as the service intends; it authorises delivery to
 * one fixed mailbox and nothing else. It is not a secret, so it lives here in
 * the source rather than in an environment variable, and there is one place to
 * change it.
 *
 * The key below is live (set 2026-08-28). `null` remains a working state, not
 * a broken one: with no key both forms take the "not connected yet" path and
 * post nothing anywhere, which is how they behaved before this and is the
 * guard that protects a build where the key goes missing.
 *
 * WHERE THE MAIL GOES is a dashboard setting, not a payload field — a form
 * that could name its own recipient would be an open relay for anyone who
 * read the page source. It is set to the client's mailbox as of 2026-08-28,
 * so an enquiry from the live site reaches her and not the developer.
 */
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY: string | null = '7387644b-a9a6-4981-84ab-a6f07aea8c92';

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
	 *
	 * Deliberately NOT wired to Web3Forms with the other two: a newsletter is a
	 * subscriber list, not a message, and routing sign-ups into an inbox gives
	 * the client a pile of addresses to manage by hand and no way to send to
	 * them. It waits for a real provider.
	 */
	newsletterAction: null as string | null,
	/**
	 * Where the contact and quote forms post. Both are the Web3Forms endpoint
	 * once a key exists, and `null` until then — see WEB3FORMS_ACCESS_KEY above.
	 * `null` is what keeps the honest "not connected yet" path alive: the forms
	 * render and validate either way, and with no key they decline to submit
	 * and say so rather than posting into the void.
	 *
	 * They are separate constants rather than one because the two could
	 * plausibly diverge later (a different service, a different mailbox), and
	 * every component reads its own.
	 */
	contactAction: (WEB3FORMS_ACCESS_KEY ? WEB3FORMS_ENDPOINT : null) as string | null,
	quoteAction: (WEB3FORMS_ACCESS_KEY ? WEB3FORMS_ENDPOINT : null) as string | null,
	/** The key itself, for the hidden `access_key` field both forms carry. */
	formAccessKey: WEB3FORMS_ACCESS_KEY as string | null,
	/**
	 * The `subject:` line of the mail Web3Forms sends. Not a translatable UI
	 * string — nobody visiting the site ever sees it; it is what the client
	 * reads in her inbox, and it stays in one language so the two kinds of
	 * enquiry sort together. The visitor's language is appended by the form so
	 * she knows which language to answer in.
	 */
	formSubjects: {
		contact: 'Kontaktanfrage über die Website',
		quote: 'Angebotsanfrage über die Website',
	},
	/**
	 * Where Web3Forms delivers. Nothing reads this — the routing lives in the
	 * Web3Forms dashboard and the code cannot set it — so this is a written
	 * record of what the dashboard is set to, kept here because a value in the
	 * source is harder to forget than a line in a chat.
	 *
	 * It is the client's own mailbox as of 2026-08-28, which is where it has to
	 * stay: a live site mailing enquiries anywhere else loses a customer every
	 * time she does not see one. It follows `email` above to the real domain
	 * mailbox when the domain exists — and that is two changes, this line and
	 * the recipient in the dashboard, which have to happen together.
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
