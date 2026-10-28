import { mapSections } from "./sections";
import { mapScripts, mapSeo } from "./seo";

/**
 * The CMS sends page content in `sections` (HeroCarousel, Marquee, ...);
 * the frontend calls them `modules`.
 * @param {any} raw
 */
export function mapPage(raw) {
	const page = raw?.page;
	if (!page) {
		return null;
	}
	return {
		id: page.id,
		slug: page.slug ?? "",
		title: page.title ?? "",
		excerpt: page.excerpt ?? "",
		modifiedAt: page.modified ?? "",
		headerStyle: page.pageSettings?.headerStyle ?? "default",
		seo: mapSeo(page.seo),
		modules: mapSections(page.sections),
		scripts: mapScripts(page.scripts),
	};
}
