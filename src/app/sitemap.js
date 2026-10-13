import { isProduction } from "@/config/env";
import { LOCALES } from "@/config/site";
import { localizePath } from "@/i18n";
import { getSite } from "@/server/services/site";
import { getSiteUrl } from "@/server/services/site-url";

// Generated at build time and refreshed hourly (or sooner when the CMS revalidates the `site` tag),
// so new posts show up without a redeploy.
export const revalidate = 3600;

/** "/hello-world/" -> "/hello-world"; the home page stays "/". */
const toPath = (uri) => `/${String(uri ?? "").split(/[?#]/)[0].split("/").filter(Boolean).join("/")}`;

/**
 * Pages, posts and categories of every enabled language, built from the CMS route table
 * (the same one that resolves URLs). Empty outside production, like robots.txt.
 */
export default async function sitemap() {
	if (!isProduction()) {
		return [];
	}
	const [site, base] = await Promise.all([getSite(), getSiteUrl()]);
	if (!site || !base) {
		return [];
	}

	const entries = new Map();
	for (const lang of LOCALES) {
		const routes = site.routes[lang];
		if (!routes) {
			continue;
		}
		for (const route of [...routes.pages, ...routes.posts, ...routes.categories]) {
			const url = `${base}${localizePath(lang, toPath(route.uri))}`;
			if (!entries.has(url)) {
				const modified = new Date(route.updatedAt);
				entries.set(url, { url, ...(Number.isNaN(modified.getTime()) ? {} : { lastModified: modified }) });
			}
		}
	}
	return [...entries.values()];
}
