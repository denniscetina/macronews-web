import { NextResponse } from "next/server";
import { cmsFetch } from "@/server/cms/client";
import { endpoints } from "@/server/cms/endpoints";

/**
 * GET /api/health        -> the app is up.
 * GET /api/health?cms=1  -> also checks the CMS connection from this runtime and reports the
 *                           HTTP status (never headers, URLs or tokens). Handy after a deploy.
 */
export async function GET(request) {
	const body = { status: "ok" };

	if (new URL(request.url).searchParams.has("cms")) {
		try {
			const site = await cmsFetch(endpoints.site(), { revalidate: 0 });
			body.cms = { ok: Boolean(site), status: site ? 200 : 404 };
		} catch (error) {
			body.cms = { ok: false, status: error.status ?? null, error: error.message };
		}
	}

	return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
