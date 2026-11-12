import { mapImage } from "./media";
import { mapScripts, mapSeo } from "./seo";

const mapTerm = (term) => ({ id: term?.id, name: term?.name ?? "", slug: term?.slug ?? "" });

/**
 * Fields of a post other than its (heavy) HTML body and its SEO.
 * @param {any} post Raw post from `/blog/:slug`
 */
export function mapPostSummary(post) {
	return {
		id: post.id,
		slug: post.slug ?? "",
		title: post.title ?? "",
		excerpt: post.excerpt ?? "",
		image: mapImage(post.featuredImage ?? post.featured_image),
		author: { id: post.author?.id, name: post.author?.name ?? "" },
		publishedAt: post.date ?? "",
		modifiedAt: post.modified ?? "",
		path: post.path ?? `/${post.slug}/`,
		categories: Array.isArray(post.categories) ? post.categories.map(mapTerm) : [],
		tags: Array.isArray(post.tags) ? post.tags.map(mapTerm) : [],
	};
}

/** @param {any} raw `/blog/:slug` payload */
export function mapPost(raw) {
	const post = raw?.post;
	if (!post) {
		return null;
	}
	return {
		...mapPostSummary(post),
		content: post.content ?? "",
		seo: mapSeo(post.seo),
		scripts: mapScripts(post.scripts),
	};
}
