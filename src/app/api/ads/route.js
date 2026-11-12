import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/config/site";
import { getAds } from "@/server/services/ads";

/**
 * Ad inventory for the browser, which must never hold the CMS key (core spec: "Ruta del inventario"). The same answer for
 * every reader, cached by Next (tag `ads:{lang}`, refreshed when the CMS saves a campaign or a brand).
 * The CDN copy lasts minutes, not the year the core suggests: `revalidateTag` does not purge Cloudflare, which sits in front.
 */
export async function GET(request) {
	const requested = request.nextUrl.searchParams.get("lang") ?? "";
	const lang = LOCALES.includes(requested) ? requested : DEFAULT_LOCALE;
	try {
		const inventory = await getAds(lang);
		return NextResponse.json(inventory ?? { label: "", campaigns: [] }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
	} catch (error) {
		console.error("[ads] could not load the inventory:", error.message);
		return NextResponse.json({ label: "", campaigns: [] }, { status: 502, headers: { "Cache-Control": "no-store" } });
	}
}
