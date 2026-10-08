import "server-only";
import { cache } from "react";
import { cmsFetch } from "@/server/cms/client";
import { endpoints } from "@/server/cms/endpoints";
import { mapPage } from "@/server/cms/mappers/page";
import { tags } from "@/server/cms/tags";

/**
 * @param {string} slug Page slug ("" is not valid, resolve the front page first)
 * @returns {Promise<ReturnType<typeof mapPage>>} null when it does not exist
 */
export const getPage = cache(async (slug) => {
	const raw = await cmsFetch(endpoints.page(slug), { tags: [tags.page(slug)] });
	return mapPage(raw);
});
