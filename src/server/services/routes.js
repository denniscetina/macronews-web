import "server-only";
import { draftMode } from "next/headers";
import { getSite } from "@/server/services/site";

const segmentsOf = (uri) => String(uri ?? "").split(/[?#]/)[0].split("/").filter(Boolean);
const sameSegments = (a, b) => a.length === b.length && a.every((segment, index) => segment === b[index]);

/**
 * Resolves a public URL to a CMS resource using the route table of the `site` payload.
 * Posts live at `/{slug}/` and categories at `/category/{slug}/` (WordPress permalinks).
 * @param {string} lang
 * @param {string[] | undefined} slug Catch-all segments, empty for the home page
 * @returns {Promise<{ type: "page" | "post" | "category", slug: string } | null>}
 */
export async function resolveRoute(lang, slug) {
	const site = await getSite();
	const segments = Array.isArray(slug) ? slug.filter(Boolean) : [];

	if (segments.length === 0) {
		const front = site?.frontPages?.[lang]?.slug;
		return front ? { type: "page", slug: front } : null;
	}

	const routes = site?.routes?.[lang];
	const page = routes?.pages.find((route) => sameSegments(segmentsOf(route.uri), segments));
	if (page) {
		return { type: "page", slug: page.slug };
	}
	const post = routes?.posts.find((route) => sameSegments(segmentsOf(route.uri), segments));
	if (post) {
		return { type: "post", slug: post.slug };
	}
	const category = routes?.categories.find((route) => sameSegments(segmentsOf(route.uri), segments));
	if (category) {
		return { type: "category", slug: category.slug };
	}

	// Drafts are not in the published route table: in draft mode the last segment is asked to the CMS as a page slug.
	return (await draftMode()).isEnabled ? { type: "page", slug: segments.at(-1) } : null;
}
