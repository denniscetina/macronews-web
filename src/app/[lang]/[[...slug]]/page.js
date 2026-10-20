import { notFound } from "next/navigation";
import ContentFrame from "@/features/seo/components/ContentFrame";
import { buildMetadata } from "@/features/seo/metadata";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { getPage } from "@/server/services/pages";
import { resolveRoute } from "@/server/services/routes";
import { getSite } from "@/server/services/site";

/**
 * Nothing is prerendered at build time (the CMS may be unreachable there). Declaring the params makes
 * each URL render once on its first request and then be cached until /revalidate or the ISR window.
 */
export function generateStaticParams() {
	return [];
}

/**
 * Resolve the URL to a CMS page. Posts and categories get their own layouts later.
 * CMS failures throw instead of returning null: a cached page must never be a 404 caused by a transient error.
 */
async function loadPage(params) {
	const { lang, slug } = await params;
	if (!(await getSite())) {
		throw new Error("[page] the CMS site settings are not available");
	}
	const route = await resolveRoute(lang, slug);
	if (route?.type !== "page") {
		return null;
	}
	return getPage(route.slug, lang);
}

export async function generateMetadata({ params }) {
	const [page, site, { lang }] = await Promise.all([loadPage(params), getSite(), params]);
	return page ? buildMetadata({ seo: page.seo, scripts: page.scripts, site, lang, fallbackTitle: page.title }) : {};
}

export default async function Page({ params }) {
	const [page, site] = await Promise.all([loadPage(params), getSite()]);
	if (!page) {
		notFound();
	}
	return (
		<ContentFrame seo={page.seo} scripts={page.scripts} site={site}>
			<ModuleRenderer modules={page.modules} />
		</ContentFrame>
	);
}
