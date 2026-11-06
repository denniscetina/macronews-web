import "server-only";
import { cmsFetch } from "@/server/cms/client";
import { endpoints } from "@/server/cms/endpoints";
import { mapReelItem } from "@/server/cms/mappers/sections";

/** Header sent to the CMS -> headers of the reader's request that carry the same datum (Cloudflare first, then Vercel). */
const VISITOR_HEADERS = {
	"X-MacroPress-Visitor-Country": ["cf-ipcountry", "x-vercel-ip-country"],
	"X-MacroPress-Visitor-Region-Code": ["cf-region-code", "x-vercel-ip-country-region"],
	"X-MacroPress-Visitor-City": ["cf-ipcity", "x-vercel-ip-city"],
	"X-MacroPress-Visitor-Postal-Code": ["cf-postal-code", "x-vercel-ip-postal-code"],
};

/**
 * More reels for the Reel Mode (`GET /reels`, cursor pagination). The CMS call leaves from the server with the API key
 * and, for `nearby`, the reader's location in its own headers. Never cached: the answer depends on the cursor and on who asks.
 * @param {{ selectionCriteria: string, dateRange: string | null, categories: number[], tags: number[], locations: number[], nearby: boolean, limit: number, lang: string | null, exclude: number[], cursor: string | null }} params
 * @param {Headers} requestHeaders Headers of the reader's request
 * @returns {Promise<{ items: ReturnType<typeof mapReelItem>[], nextCursor: string | null } | null>}
 */
export async function getReels(params, requestHeaders) {
	const query = new URLSearchParams({ selectionCriteria: params.selectionCriteria, limit: String(params.limit) });
	for (const key of ["categories", "tags", "locations", "exclude"]) {
		if (params[key].length) query.set(key, params[key].join(","));
	}
	if (params.dateRange) query.set("dateRange", params.dateRange);
	if (params.nearby) query.set("nearby", "1");
	if (params.lang) query.set("lang", params.lang);
	if (params.cursor) query.set("cursor", params.cursor);

	const headers = {};
	if (params.nearby) {
		for (const [name, sources] of Object.entries(VISITOR_HEADERS)) {
			const value = sources.map((source) => requestHeaders.get(source)).find(Boolean);
			if (value) headers[name] = value;
		}
	}

	const raw = await cmsFetch(endpoints.reels(query), { headers, noStore: true });
	if (!raw) {
		return null;
	}
	return {
		items: (Array.isArray(raw.items) ? raw.items : []).map(mapReelItem).filter((item) => item.title && item.poster),
		nextCursor: typeof raw.nextCursor === "string" && raw.nextCursor ? raw.nextCursor : null,
	};
}
