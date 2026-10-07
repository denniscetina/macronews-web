import { getPageData } from "@/lib/api";
import ModuleRenderer from "@/components/ModuleRenderer";
import { getDictionarySafe } from "@/lib/i18n";
import { getWebsiteSettingsData } from "@/lib/website-settings";
import { notFound } from "next/navigation";
import Schemas from "@/components/utils/Schemas";
import PageHeaderStateSync from "@/components/layout/PageHeaderStateSync";
import WebContent from "@/components/layout/WebContent";
import HeadCodeInjection from "@/components/utils/HeadCodeInjection.client";
import CodeInjection from "@/components/utils/CodeInjection";
import { resolveBodyInjection, resolveHeadInjection } from "@/lib/code-injection";

//Disable dynamic params - only pages from CMS are generated
//export const dynamicParams = false;

export async function generateMetadata({ params }){
	const { slug, lang } = await params;
	const { type, requestSlug } = await resolvePageRequestData({ slug, lang });
	const data = await getPageData({ slug: requestSlug, type });
	const headInjection = resolveHeadInjection(data?.page?.scripts?.head);
	return {
		title: data?.page?.seo?.title || "Unico Hotel Riviera Maya",
		description: data?.page?.seo?.metaDesc || "Unico Hotel Riviera Maya",
		openGraph:{
			title: data?.page?.seo?.ogTitle,
			description: data?.page?.seo?.ogDescription,
			images: data?.page?.seo?.ogImage
		},
		alternates:{
			canonical: normalizeCanonicalUrl(data?.page?.seo?.canonical || "")
		},
		other: headInjection.metadata.other
	}
}

function normalizeCanonicalUrl(url) {
	try {
		const canonicalUrl = new URL(url);
		//remove www if exists to hostname
		const canonicalHotsname = canonicalUrl.hostname.replace(/^www\./, "");
		//remove trailing slash for canonical
		const canonicalPathname = canonicalUrl.pathname !== "/" ? canonicalUrl.pathname.replace(/\/+$/, "") : "/";
		// Generate full canonical URL win https://wwww.
		return `https://www.${canonicalHotsname}${canonicalPathname}${canonicalUrl.search}${canonicalUrl.hash}`;
	} catch (error) {
		return url;
	}
}


/**
 * Normalize slug value
 * @param {string} slug
 * @returns {string}
 * @description Normalize slug value removing empty segments and trailing slash
 */
function normalizeSlugValue(slug) {
	if (Array.isArray(slug)) {
		return slug.filter(Boolean).join("/");
	}

	return typeof slug === "string" ? slug.trim() : "";
}

/**
 * Get slug segments from uri
 * @param {{ uri: string, lang: string }} param0
 * @returns {string[]}
 * @description Get slug segments from uri removing query and hash
 */
function getSlugSegmentsFromUri({ uri, lang }) {
	if (typeof uri !== "string") {
		return [];
	}

	const withoutQuery = uri.split("?")[0].split("#")[0];
	const withoutTrailingSlash = withoutQuery.replace(/\/+$/, "");

	if (!withoutTrailingSlash) {
		return [];
	}

	const segments = withoutTrailingSlash.split("/").filter(Boolean);

	if (segments[0] === lang) {
		return segments.slice(1);
	}

	return segments;
}

/**
 * @param slug
 * @returns {*|string[]|*[]}
 * @description Get slug segments from slug removing empty segments and trailing slash
 */
function getSlugSegments(slug) {
	if (Array.isArray(slug)) {
		return slug.filter(Boolean);
	}

	const normalizedSlug = normalizeSlugValue(slug);

	return normalizedSlug ? normalizedSlug.split("/").filter(Boolean) : [];
}

/**
 * Resolve content request
 * @param {{ routes: any, lang: string, slugSegments: string[], fallbackSlug: string }} param0
 * @returns {{ type: string, slug: string }}
 * @description Resolve content request from slug segments and routes
 */
function resolveContentRequest({ routes, lang, slugSegments, fallbackSlug }) {
	const normalizedSlug = slugSegments.join("/");
	if (!normalizedSlug) {
		//If slug is empty, get the fallback slug for obtain the resolvePath from routes filter by slug
		return getResolvePath(lang, routes, fallbackSlug);
		/*
		return {
			type: "pages",
			slug: fallbackSlug,
		};*/
	}

	return getResolvePath(lang, routes, normalizedSlug);
}

function getResolvePath(lang, routes, slug){
	const postsByType = routes?.[lang]?.posts || {};

	for (const [type, entries] of Object.entries(postsByType)) {
		if (!Array.isArray(entries)) {
			continue;
		}

		for (const entry of entries) {
			const routeSlug = getSlugSegmentsFromUri({ uri: entry?.uri, lang }).join("/");

			if (routeSlug !== slug) {
				continue;
			}

			const entrySlug = normalizeSlugValue(entry?.resolvePath);

			return {
				slug: entrySlug || slug,
				type: null
			};
		}
	}

	return {
		type: "pages",
		slug: slug,
	};
}

/**
 * Resolve page request data from route params
 * @param {{ slug: string | string[] | undefined, lang: string }} param0
 * @returns {Promise<{ type: string, requestSlug: string, site: any }>}
 */
async function resolvePageRequestData({ slug, lang }) {
	const slugSegments = getSlugSegments(slug);
	const { routes, frontPages, site } = await getWebsiteSettingsData(lang);
	const frontPageSlug = normalizeSlugValue(frontPages?.[lang]?.slug);
	const normalizedSlug = normalizeSlugValue(slugSegments) || frontPageSlug;
	const { type, slug: requestSlug } = resolveContentRequest({
		routes,
		lang,
		slugSegments,
		fallbackSlug: normalizedSlug,
	});

	return {
		type,
		requestSlug,
		site,
	};
}

/**
 * @param {{ params: any }} param0
 * @returns {Promise<import("react").JSX.Element>}
 * @description Export default page component
 */
export default async function Page({ params }) {
    const { slug, lang } = await params;
	const { type, requestSlug, site } = await resolvePageRequestData({ slug, lang });
	const normalizedRequestSlug = normalizeSlugValue(requestSlug);
	const lowerRequestSlug = normalizedRequestSlug.toLowerCase();
	const hasInvalidRequestSlug =
		!normalizedRequestSlug ||
		lowerRequestSlug === "null" ||
		lowerRequestSlug === "undefined";

	if (hasInvalidRequestSlug) {
		notFound();
	}

    const pageData = await getPageData({ slug: normalizedRequestSlug, type });

	if (pageData === null) {
		notFound();
	}

	const pageSettings = pageData?.page?.pageSettings || {};
	const pageScripts = pageData?.page?.scripts || {};
	const headInjection = resolveHeadInjection(pageScripts.head);
	const bodyStartScripts = resolveBodyInjection(pageScripts.bodyStart);
	const bodyEndScripts = resolveBodyInjection(pageScripts.bodyEnd);
	const dictionary = await getDictionarySafe(lang);
	return (
		<>
			<HeadCodeInjection scripts={headInjection.clientScripts} />
			<CodeInjection position="bodyStart" scripts={bodyStartScripts} />
			<WebContent>
				<PageHeaderStateSync headerStyle={pageSettings.headerStyle} />
				<Schemas schemas={ pageData?.page?.seo?.schemas || [] } />
				<ModuleRenderer data={pageData} site={site} dictionary={dictionary} lang={lang} />
			</WebContent>
			<CodeInjection position="bodyEnd" scripts={bodyEndScripts} />
		</>
	);

}

/**
 * @returns {Promise<{ lang: string; slug: string[] }[]>}
 * @description Generate static params for all pages and posts
 */
export async function generateStaticParams(){
	//Get all routes
	const { routes = {}, frontPages = {}, languages = {}} = await getWebsiteSettingsData();
	const availableLangs = languages?.available
		.map((language) => language?.slug)
		.filter(Boolean);
	//Get post routes per lang
	const staticParams = [];
	const seen = new Set();

	for (const lang of availableLangs) {
		const frontPageSlug = normalizeSlugValue(frontPages?.[lang]?.slug);

		if (frontPageSlug) {
			const homeKey = `${lang}::`;
			if (!seen.has(homeKey)) {
				seen.add(homeKey);
				staticParams.push({ lang, slug: [] });
			}
		}

		const postsByType = routes?.[lang]?.posts || {};

		for (const entries of Object.values(postsByType)) {
			if (!Array.isArray(entries)) {
				continue;
			}

			for (const entry of entries) {
				const slug = getSlugSegmentsFromUri({ uri: entry?.uri, lang });
				const dedupeKey = `${lang}::${slug.join("/")}`;
				const homeKey = `${lang}::${frontPageSlug}`;

				if (seen.has(dedupeKey)) {
					continue;
				}
				//Exclude frontpages from page generator
				if(dedupeKey === homeKey){
					seen.add(homeKey);
					continue;
				}
				seen.add(dedupeKey);
				staticParams.push({ lang, slug });
			}
		}
	}
	return staticParams;
}
