import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { cmsFetch } from "@/server/cms/client";
import { endpoints } from "@/server/cms/endpoints";
import { mapPost } from "@/server/cms/mappers/post";
import { tags } from "@/server/cms/tags";

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
