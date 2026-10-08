import "server-only";
import { cache } from "react";
import { cmsFetch } from "@/server/cms/client";
import { endpoints } from "@/server/cms/endpoints";
import { mapSite } from "@/server/cms/mappers/site";
import { tags } from "@/server/cms/tags";

/**
 * Site settings, menus, languages and routes. Deduplicated per request.
 * Returns null when the CMS is unreachable or not configured yet, so the shell can still render.
 */
export const getSite = cache(async () => {
	try {
		const raw = await cmsFetch(endpoints.site(), { tags: [tags.site] });
		return raw ? mapSite(raw) : null;
	} catch (error) {
		console.error("[site] could not load site settings:", error.message);
		return null;
	}
});
