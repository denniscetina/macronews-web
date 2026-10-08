import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getEnv } from "@/config/env";
import { isValidToken } from "@/server/auth";
import { cleanPreviewSegments } from "@/features/preview/routing";

/**
 * GET /api/draft?token=<DRAFT_MODE_TOKEN>&slug=<slug>&lang=<lang>
 * Called by the CMS "Preview" button: enables draft mode and opens the preview shell.
 */
export async function GET(request) {
	const { searchParams } = new URL(request.url);
	const { DRAFT_MODE_TOKEN } = getEnv();

	if (!isValidToken(searchParams.get("token"), DRAFT_MODE_TOKEN) || !searchParams.get("slug")) {
		return new Response("Invalid token", { status: 401 });
	}

	const segments = cleanPreviewSegments(searchParams.get("slug"));
	const lang = (searchParams.get("lang") ?? "").trim();
	if (lang && segments[0] !== lang) {
		segments.unshift(lang);
	}

	(await draftMode()).enable();
	// Only ever redirect inside /preview: segments are encoded, so no external URLs are possible.
	redirect(`/preview/${segments.map(encodeURIComponent).join("/")}`);
}
