import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { cmsFetch } from "@/server/cms/client";
import { endpoints } from "@/server/cms/endpoints";
import { mapPost, mapPosts } from "@/server/cms/mappers/post";
import { tags } from "@/server/cms/tags";

const DEFAULT_PER_PAGE = 12;

/**
 * All published posts of a language, newest first, without their HTML body.
 * The CMS `/blog` endpoint ignores filters, so category/search/pagination are applied here
 * (see `getPosts`). Cached under `type:post`, invalidated whenever a post changes.
 * @param {string} lang
 */
const getAllPosts = cache(async (lang) => {
	const raw = await cmsFetch(endpoints.posts(lang), { tags: [tags.type("post")] });
	return mapPosts(raw).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
});

/**
 * Paginated listing, optionally filtered by category slug.
 * @param {string} lang
 * @param {{ category?: string, page?: number, perPage?: number }} [options]
 */
export async function getPosts(lang, { category, page = 1, perPage = DEFAULT_PER_PAGE } = {}) {
	const all = await getAllPosts(lang);
	const filtered = category ? all.filter((post) => post.categories.some((term) => term.slug === category)) : all;
	const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
	const current = Math.min(Math.max(1, page), totalPages);
	return {
		items: filtered.slice((current - 1) * perPage, current * perPage),
		total: filtered.length,
		page: current,
		perPage,
		totalPages,
	};
}

/**
 * @param {string} slug
 * @param {string} lang
 * @returns {Promise<ReturnType<typeof mapPost>>} null when it does not exist
 */
export const getPost = cache(async (slug, lang) => {
	const { isEnabled: draft } = await draftMode();
	const raw = await cmsFetch(endpoints.post(slug, lang, { draft }), { tags: [tags.post(slug), tags.type("post")] });
	return mapPost(raw);
});
