import { notFound } from "next/navigation";
import ContentFrame from "@/features/seo/components/ContentFrame";
import { buildMetadata } from "@/features/seo/metadata";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { getPage } from "@/server/services/pages";
import { resolveRoute } from "@/server/services/routes";
import { getSite } from "@/server/services/site";

/** Resolve the URL to a CMS page. Posts and categories get their own layouts later. */
async function loadPage(params) {
	const { lang, slug } = await params;
	const route = await resolveRoute(lang, slug);
	if (route?.type !== "page") {
		return null;
	}
	try {
		return await getPage(route.slug, lang);
	} catch (error) {
		console.error(`[page] could not load "${route.slug}":`, error.message);
		return null;
	}
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
