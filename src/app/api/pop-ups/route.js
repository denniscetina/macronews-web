import { NextResponse } from "next/server";
import {rewriteCmsUrls} from "@/lib/rewriteCmsUrls";

const POP_UPS_URL =
	process.env.WEB_API_URL ??
	"";

const WEB_API_HEADER_KEY = process.env.WEB_API_HEADER_KEY;
const WEB_API_TOKEN = process.env.WEB_API_TOKEN;
const SERVER_USER = process.env.SERVER_USER;
const SERVER_PASS = process.env.SERVER_PASS ?? process.env.SERVER_PASSWORD;
const IS_PRODUCTION = process.env.APP_ENV === "production";

const buildPopupsInitUrl = (baseUrl) => {
	const parsedUrl = new URL(baseUrl);
	const sanitizedPath = parsedUrl.pathname.replace(/\/+$/, "");

	if (sanitizedPath.toLowerCase().endsWith("/popups/init")) {
		return parsedUrl;
	}

	parsedUrl.pathname = `${sanitizedPath}/popups/init`.replace(/\/+/g, "/");
	parsedUrl.search = "";
	parsedUrl.hash = "";

	return parsedUrl;
};

const getApiAuthHeaders = () => {
	const headers = {};

	if (WEB_API_HEADER_KEY && WEB_API_TOKEN) {
		headers[WEB_API_HEADER_KEY] = WEB_API_TOKEN;
	}

	if (!IS_PRODUCTION && SERVER_USER && SERVER_PASS) {
		const basicAuthToken = Buffer.from(`${SERVER_USER}:${SERVER_PASS}`).toString(
			"base64",
		);
		headers.Authorization = `Basic ${basicAuthToken}`;
	}

	return headers;
};

export async function GET() {
	try {
		const outboundUrl = buildPopupsInitUrl(POP_UPS_URL);

		const response = await fetch(outboundUrl, {
			method: "GET",
			headers: {
				Accept: "application/json",
				...getApiAuthHeaders(),
			},
			next: {
				revalidate: 300,
			},
		});
		if (!response.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch pop-up offers data" },
				{ status: response.status },
			);
		}

		const data = rewriteCmsUrls(await response.json());

		return NextResponse.json(Array.isArray(data) ? data : [], {
			status: 200,
			headers: {
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch {
		return NextResponse.json(
			{
				error: "Unexpected error fetching pop-up offers data",
			},
			{ status: 500 },
		);
	}
}
