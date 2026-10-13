import { decodeEntities } from "@/lib/text";

const text = (value) => decodeEntities(typeof value === "string" ? value : "").trim();

/** Social image: the CMS may send a plain URL or an object with `url`. */
const imageUrl = (value) => (typeof value === "string" ? value : typeof value?.url === "string" ? value.url : "");

/** @param {any} raw */
export function mapSeo(raw) {
	return {
		title: text(raw?.title),
		description: text(raw?.metaDesc) || text(raw?.ogDescription),
		canonical: typeof raw?.canonical === "string" ? raw.canonical.trim() : "",
		noIndex: Boolean(raw?.robotsNoIndex),
		noFollow: Boolean(raw?.robotsNoFollow),
		og: { title: text(raw?.ogTitle), description: text(raw?.ogDescription), image: imageUrl(raw?.ogImage) },
		twitter: { title: text(raw?.twitterTitle), description: text(raw?.twitterDescription), image: imageUrl(raw?.twitterImage) },
		schemas: Array.isArray(raw?.schemas) ? raw.schemas : [],
	};
}

/**
 * Site scripts (CMS > Site Scripts) already filtered by the CMS for this content:
 * `[{ id, name, code, priority }]` per placement.
 * @param {any} raw
 */
export function mapScripts(raw) {
	const list = (value) => (Array.isArray(value) ? value.filter((script) => script && typeof script === "object") : []);
	return { head: list(raw?.head), bodyStart: list(raw?.bodyStart), bodyEnd: list(raw?.bodyEnd) };
}
