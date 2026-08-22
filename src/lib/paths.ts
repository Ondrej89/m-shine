/**
 * Base-path helpers.
 *
 * The site is built twice with different roots: at the domain root for
 * production, and under a repository subpath for the GitHub Pages preview
 * (`/M-Shine/` or whatever the repo is called). Astro puts that prefix in
 * `import.meta.env.BASE_URL` and rewrites two things for us — the bundled
 * assets it emits, and `url()` references to `public/` inside CSS, which is why
 * flourishes.css and footer.css need no changes.
 *
 * It does NOT rewrite absolute paths written as strings in markup: an
 * `<img src="/img/x.webp">`, a font preload, the favicon, or an internal link.
 * Those go through `withBase()`.
 *
 * With no base set, `BASE_URL` is `/` and every path comes back unchanged, so
 * this is a no-op in local development and in a root deployment.
 */

/** `/img/x.webp` -> `/M-Shine/img/x.webp`, and unchanged when there is no base. */
export function withBase(path: string): string {
	const base = import.meta.env.BASE_URL;
	if (!base || base === '/') return path;
	// BASE_URL is always trailing-slashed; site paths are always leading-slashed.
	return `${base.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
