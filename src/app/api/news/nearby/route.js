import { NextResponse } from "next/server";
import { getNearbyNews } from "@/server/services/news-nearby";

const CRITERIA = ["latest", "featured", "random"];
const ids = (value) => String(value ?? "").split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0).slice(0, 20);

/**
 * Public face of the CMS `news/nearby` endpoint for the browser, which must never hold the CMS key.
 * Validates the query, adds the reader's location headers and answers `private, no-store`.
 */
export async function GET(request) {
	const query = request.nextUrl.searchParams;
	const criteria = query.get("selectionCriteria");
	const params = {
		selectionCriteria: CRITERIA.includes(criteria) ? criteria : "latest",
		postsLimit: Math.min(20, Math.max(1, Number(query.get("postsLimit")) || 8)),
		categories: ids(query.get("categories")),
		tags: ids(query.get("tags")),
		dateRange: /^[a-z0-9_]{1,20}$/.test(query.get("dateRange") ?? "") ? query.get("dateRange") : null,
		lang: /^[a-z]{2,3}$/.test(query.get("lang") ?? "") ? query.get("lang") : null,
	};
	try {
		const result = await getNearbyNews(params, request.headers);
		return NextResponse.json(result ?? { location: null, items: [] }, { headers: { "Cache-Control": "private, no-store" } });
	} catch (error) {
		console.error("[news-nearby] could not load the nearby news:", error.message);
		return NextResponse.json({ location: null, items: [] }, { status: 502, headers: { "Cache-Control": "private, no-store" } });
	}
}
