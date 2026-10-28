import "server-only";
import { cmsFetch } from "@/server/cms/client";
import { endpoints } from "@/server/cms/endpoints";
import { mapNewsItem } from "@/server/cms/mappers/sections";

/** Header sent to the CMS -> headers of the reader's request that carry the same datum (Cloudflare first, then Vercel). */
const VISITOR_HEADERS = {
	"X-MacroPress-Visitor-Country": ["cf-ipcountry", "x-vercel-ip-country"],
	"X-MacroPress-Visitor-Region-Code": ["cf-region-code", "x-vercel-ip-country-region"],
	"X-MacroPress-Visitor-City": ["cf-ipcity", "x-vercel-ip-city"],
	"X-MacroPress-Visitor-Postal-Code": ["cf-postal-code", "x-vercel-ip-postal-code"],
};

/**
 * News of the reader's location (`GET /news/nearby`). The CMS call leaves from the server and carries the
 * reader's location in its own headers, because a Cloudflare in front of the CMS would replace `cf-*` with ours.
 * Never cached: the answer depends on who asks.
 * @param {{ selectionCriteria: string, postsLimit: number, categories: number[], tags: number[], dateRange: string | null, lang: string | null }} params
 * @param {Headers} requestHeaders Headers of the reader's request
 * @returns {Promise<{ location: { name: string } | null, items: ReturnType<typeof mapNewsItem>[] } | null>}
 */
export async function getNearbyNews(params, requestHeaders) {
	const query = new URLSearchParams({ selectionCriteria: params.selectionCriteria, postsLimit: String(params.postsLimit) });
	if (params.categories.length) query.set("categories", params.categories.join(","));
	if (params.tags.length) query.set("tags", params.tags.join(","));
	if (params.dateRange) query.set("dateRange", params.dateRange);
	if (params.lang) query.set("lang", params.lang);

	const headers = {};
	for (const [name, sources] of Object.entries(VISITOR_HEADERS)) {
		const value = sources.map((source) => requestHeaders.get(source)).find(Boolean);
		if (value) headers[name] = value;
	}

	const raw = await cmsFetch(endpoints.newsNearby(query), { headers, noStore: true });
	if (!raw) {
		return null;
	}
	return {
		location: raw.location?.name ? { name: String(raw.location.name) } : null,
		items: (Array.isArray(raw.items) ? raw.items : []).map(mapNewsItem).filter((item) => item.title),
	};
}
