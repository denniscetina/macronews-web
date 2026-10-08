import { notFound } from "next/navigation";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { getPage } from "@/server/services/pages";
import { getSite } from "@/server/services/site";

/** Resolve the CMS slug for the requested URL ("" means the front page of that language). */
async function resolveSlug(lang, slug) {
	const joined = Array.isArray(slug) ? slug.filter(Boolean).join("/") : "";
	if (joined) {
		return joined;
	}
	const site = await getSite();
	return site?.frontPages?.[lang]?.slug ?? "";
}

async function loadPage(params) {
	const { lang, slug } = await params;
	const resolved = await resolveSlug(lang, slug);
	if (!resolved) {
		return null;
	}
	try {
		return await getPage(resolved);
	} catch (error) {
		console.error(`[page] could not load "${resolved}":`, error.message);
		return null;
	}
}

export async function generateMetadata({ params }) {
	const page = await loadPage(params);
	return {
		title: page?.seo?.title || undefined,
		description: page?.seo?.metaDesc || undefined,
	};
}

export default async function Page({ params }) {
	const page = await loadPage(params);
	if (!page) {
		notFound();
	}
	return <ModuleRenderer modules={page.modules} />;
}
