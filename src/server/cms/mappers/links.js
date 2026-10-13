/**
 * Turns a CMS URL into something the frontend can link to.
 * - "#" or empty (placeholder items in the CMS) -> no href
 * - URLs of this site (public or CMS origin) -> relative path
 * - anything else -> external
 * @param {string | null | undefined} url
 * @param {string[]} [origins] Origins that count as "this site"
 * @returns {{ href: string | null, external: boolean }}
 */
export function resolveHref(url, origins = []) {
	const value = String(url ?? "").trim();
	if (!value || value === "#") {
		return { href: null, external: false };
	}
	if (value.startsWith("/") || value.startsWith("#")) {
		return { href: value, external: false };
	}
	try {
		const parsed = new URL(value);
		if (origins.includes(parsed.origin)) {
			return { href: `${parsed.pathname}${parsed.search}${parsed.hash}` || "/", external: false };
		}
		return { href: value, external: true };
	} catch {
		return { href: null, external: false };
	}
}

/** Origin of a URL, or null when it is not a valid absolute URL. */
export function originOf(url) {
	try {
		return new URL(url).origin;
	} catch {
		return null;
	}
}
