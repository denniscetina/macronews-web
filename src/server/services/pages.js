import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { cmsFetch } from "@/server/cms/client";
import { endpoints } from "@/server/cms/endpoints";
import { mapPage } from "@/server/cms/mappers/page";
import { tags } from "@/server/cms/tags";

/**
 * @param {string} slug Page slug ("" is not valid, resolve the front page first)
 * @param {string} lang
 * @returns {Promise<ReturnType<typeof mapPage>>} null when it does not exist
 */
export const getPage = cache(async (slug, lang) => {
	const { isEnabled: draft } = await draftMode();
	const raw = await cmsFetch(endpoints.page(slug, lang, { draft }), { tags: [tags.page(slug)] });
	return mapPage(raw);
});
