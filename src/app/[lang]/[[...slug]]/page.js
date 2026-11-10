import { notFound } from "next/navigation";
import ContentFrame from "@/features/seo/components/ContentFrame";
import ClassicPost from "@/features/post/ClassicPost";
import { buildMetadata } from "@/features/seo/metadata";
import ModuleRenderer from "@/modules/ModuleRenderer";
import { getPage } from "@/server/services/pages";
import { getPost } from "@/server/services/posts";
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
 * Resolve the URL to a CMS page or post (the classic template). Categories get their own layout later.
 * CMS failures throw instead of returning null: a cached page must never be a 404 caused by a transient error.
 */
async function loadPage(params) {
	const { lang, slug } = await params;
	if (!(await getSite())) {
		throw new Error("[page] the CMS site settings are not available");
	}
	const route = await resolveRoute(lang, slug);
	if (route?.type === "post") {
		const post = await getPost(route.slug, lang);
		return post ? { kind: "post", post } : null;
	}
	if (route?.type !== "page") {
		return null;
	}
	const page = await getPage(route.slug, lang);
	return page ? { kind: "page", page } : null;
}

export async function generateMetadata({ params }) {
	const [loaded, site, { lang }] = await Promise.all([loadPage(params), getSite(), params]);
	if (!loaded) {
		return {};
	}
	if (loaded.kind === "post") {
		const { post } = loaded;
		return buildMetadata({ seo: post.seo, scripts: post.scripts, site, lang, fallbackTitle: post.title, type: "article", publishedTime: post.publishedAt, modifiedTime: post.modifiedAt });
	}
	const { page } = loaded;
	return buildMetadata({ seo: page.seo, scripts: page.scripts, site, lang, fallbackTitle: page.title });
}

export default async function Page({ params }) {
	const [loaded, site, { lang, slug }] = await Promise.all([loadPage(params), getSite(), params]);
	if (!loaded) {
		notFound();
	}
	if (loaded.kind === "post") {
		const { post } = loaded;
		return (
			<ContentFrame seo={post.seo} scripts={post.scripts} site={site}>
				<ClassicPost post={post} site={site} lang={lang} />
			</ContentFrame>
		);
	}
	const { page } = loaded;
	return (
		<ContentFrame seo={page.seo} scripts={page.scripts} site={site}>
			<ModuleRenderer modules={page.modules} lang={lang} context={{ isHome: !slug?.length }} />
		</ContentFrame>
	);
}
