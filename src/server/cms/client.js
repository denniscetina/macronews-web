import "server-only";
import { draftMode } from "next/headers";
import { getEnv } from "@/config/env";

const DEFAULT_REVALIDATE = 3600;
const REQUEST_TIMEOUT_MS = 10000;

/**
 * WEB_API_URL may point to the root (`.../wp-json/api/v1`) or to the `site` endpoint
 * (`.../wp-json/api/v1/site`). Endpoints are always relative to the root.
 * @param {string} url
 */
export const apiRoot = (url) => url.replace(/\/+$/, "").replace(/\/site$/, "");

export class CmsError extends Error {
	constructor(message, { status, url } = {}) {
		super(message);
		this.name = "CmsError";
		this.status = status;
		this.url = url;
	}
}

/**
 * The only function that talks to the CMS.
 * - 404 -> null (resource does not exist)
 * - any other failure -> throws CmsError (Next keeps serving the cached copy)
 * @param {string} path Path from `endpoints`
 * @param {{ tags?: string[], revalidate?: number | false }} [options]
 * @returns {Promise<any | null>}
 */
export async function cmsFetch(path, { tags = [], revalidate = DEFAULT_REVALIDATE } = {}) {
	const env = getEnv();
	const { isEnabled: isDraft } = await draftMode();
	const baseUrl = isDraft ? env.WEB_API_URL_PREVIEW || env.WEB_API_URL : env.WEB_API_URL;

	if (!baseUrl || !env.WEB_API_HEADER_KEY || !env.WEB_API_TOKEN) {
		throw new CmsError("CMS is not configured: set WEB_API_URL, WEB_API_HEADER_KEY and WEB_API_TOKEN");
	}

	const url = `${apiRoot(baseUrl)}/${path.replace(/^\/+/, "")}`;
	const response = await fetch(url, {
		headers: {
			Accept: "application/json",
			// Identifies this app: lets the CMS firewall (Cloudflare) allow or log it explicitly.
			"User-Agent": "MacronewsWeb/1.0",
			[env.WEB_API_HEADER_KEY]: env.WEB_API_TOKEN,
		},
		signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
		...(isDraft ? { cache: "no-store" } : { next: { revalidate, tags } }),
	});

	if (response.status === 404) {
		return null;
	}
	if (!response.ok) {
		throw new CmsError(`CMS responded ${response.status}`, { status: response.status, url });
	}
	return response.json();
}
