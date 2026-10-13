import { isProduction } from "@/config/env";
import { resolveHeadInjection } from "./code-injection";

/**
 * Next.js metadata for any CMS resource from its mapped `seo` and `scripts`.
 * Child metadata replaces the parent's `openGraph` and `robots` entirely, so both are rebuilt here
 * with the site-level values (site name, locale, no-index outside production).
 * @param {{
 *   seo: ReturnType<typeof import("@/server/cms/mappers/seo").mapSeo>,
 *   scripts?: { head: any[] },
 *   site?: { name: string, locale: string, languages: { available: Array<{ slug: string, locale: string }> } } | null,
 *   lang?: string,
 *   fallbackTitle?: string,
 *   type?: "website" | "article",
 *   publishedTime?: string,
 *   modifiedTime?: string,
 * }} input
 * @returns {import("next").Metadata}
 */
/**
 * The CMS builds canonicals with a trailing slash ("/hello-world/") but Next.js redirects those
 * URLs to the slash-less form, and a canonical must not point to a redirect.
 */
const canonicalOf = (url) => {
	try {
		const { pathname } = new URL(url);
		return pathname.length > 1 ? url.replace(/\/+$/, "") : url;
	} catch {
		return url;
	}
};

export function buildMetadata({ seo, scripts, site, lang, fallbackTitle, type = "website", publishedTime, modifiedTime }) {
	const title = seo.title || fallbackTitle || site?.name || undefined;
	const description = seo.description || undefined;
	const image = seo.og.image || seo.twitter.image || undefined;
	// The WordPress locale is a site-wide setting (en_US today); the per-language one comes from Polylang.
	const locale = site?.languages.available.find((language) => language.slug === lang)?.locale || site?.locale || undefined;
	const canonical = seo.canonical ? canonicalOf(seo.canonical) : undefined;
	const indexable = isProduction() && !seo.noIndex;

	return {
		title,
		description,
		alternates: canonical ? { canonical } : undefined,
		openGraph: {
			type,
			siteName: site?.name || undefined,
			locale,
			title: seo.og.title || title,
			description: seo.og.description || description,
			url: canonical,
			images: image ? [image] : undefined,
			...(type === "article" ? { publishedTime, modifiedTime } : {}),
		},
		twitter: {
			card: image ? "summary_large_image" : "summary",
			title: seo.twitter.title || seo.og.title || title,
			description: seo.twitter.description || seo.og.description || description,
			images: seo.twitter.image || image ? [seo.twitter.image || image] : undefined,
		},
		robots: { index: indexable, follow: isProduction() && !seo.noFollow },
		other: resolveHeadInjection(scripts?.head).other,
	};
}
