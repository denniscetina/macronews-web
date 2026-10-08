import { NextResponse } from "next/server";
import { getEnv } from "@/config/env";
import { getBearerToken, isValidToken } from "@/server/auth";
import { resolveRevalidation, revalidateContent } from "@/server/revalidation";

/**
 * GET|POST /api/revalidate (also reachable as /revalidate)
 *
 * Token: `Authorization: Bearer <token>`, or `token` in the body (POST) / query (GET).
 * Params: target ("layout"), lang, slug|slugs, path|paths, tags (comma separated or arrays).
 * Prefer POST with Bearer: tokens in a URL end up in access logs.
 */
async function handle(request, input) {
	const { REVALIDATE_TOKEN } = getEnv();
	if (!REVALIDATE_TOKEN) {
		return NextResponse.json({ error: "REVALIDATE_TOKEN is not configured" }, { status: 500 });
	}
	if (!isValidToken(getBearerToken(request) ?? input.token, REVALIDATE_TOKEN)) {
		return NextResponse.json({ error: "Invalid token" }, { status: 401 });
	}

	const targets = resolveRevalidation(input);
	if (!targets) {
		return NextResponse.json({ error: "Nothing to revalidate: send target, lang, slug, path or tags" }, { status: 400 });
	}
	return NextResponse.json({ revalidated: true, ...revalidateContent(targets) });
}

export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const input = Object.fromEntries(
		["token", "target", "lang"].map((key) => [key, searchParams.get(key)]),
	);
	for (const key of ["slug", "slugs", "path", "paths", "tags"]) {
		input[key] = searchParams.getAll(key);
	}
	return handle(request, input);
}

export async function POST(request) {
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== "object") {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}
	return handle(request, body);
}
