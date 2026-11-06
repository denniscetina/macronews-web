import { NextResponse } from "next/server";
import { getReels } from "@/server/services/reels";

const CRITERIA = ["latest", "featured", "random"];
const ids = (value, max = 20) => String(value ?? "").split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0).slice(0, max);

/**
 * Public face of the CMS `reels` endpoint for the browser (Reel Mode), which must never hold the CMS key.
 * Only the known filters are forwarded, validated; answers `private, no-store`.
 */
export async function GET(request) {
	const query = request.nextUrl.searchParams;
	const criteria = query.get("selectionCriteria");
	const params = {
		selectionCriteria: CRITERIA.includes(criteria) ? criteria : "latest",
		dateRange: /^[a-z0-9_]{1,20}$/.test(query.get("dateRange") ?? "") ? query.get("dateRange") : null,
		categories: ids(query.get("categories")),
		tags: ids(query.get("tags")),
		locations: ids(query.get("locations")),
		nearby: query.get("nearby") === "1" || query.get("nearby") === "true",
		limit: Math.min(20, Math.max(1, Number(query.get("limit")) || 8)),
		lang: /^[a-z]{2,3}$/.test(query.get("lang") ?? "") ? query.get("lang") : null,
		exclude: ids(query.get("exclude"), 100),
		cursor: /^[A-Za-z0-9_-]{1,200}$/.test(query.get("cursor") ?? "") ? query.get("cursor") : null,
	};
	try {
		const result = await getReels(params, request.headers);
		return NextResponse.json(result ?? { items: [], nextCursor: null }, { headers: { "Cache-Control": "private, no-store" } });
	} catch (error) {
		console.error("[reels] could not load more reels:", error.message);
		return NextResponse.json({ items: [], nextCursor: null }, { status: 502, headers: { "Cache-Control": "private, no-store" } });
	}
}
