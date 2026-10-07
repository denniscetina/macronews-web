import { NextResponse } from "next/server";

const CTA_ROOMS_URL =
	process.env.CTA_ROOMS_URL ??
	"";
const WEB_API_HEADER_KEY = process.env.WEB_API_HEADER_KEY;
const WEB_API_TOKEN = process.env.WEB_API_TOKEN;
const SERVER_USER = process.env.SERVER_USER;
const SERVER_PASS = process.env.SERVER_PASS ?? process.env.SERVER_PASSWORD;
const IS_PRODUCTION = process.env.APP_ENV === "production";

const GEO_QUERY_PARAM_MAP = {
	"x-client-country": "country",
	"x-client-region-subdivision": "subdivision",
	"x-client-city": "city",
};

function getApiAuthHeaders() {
	if (!WEB_API_HEADER_KEY || !WEB_API_TOKEN) {
		return null;
	}

	const headers = {
		[WEB_API_HEADER_KEY]: WEB_API_TOKEN,
	};

	if (IS_PRODUCTION) {
		return headers;
	}

	if (!SERVER_USER || !SERVER_PASS) {
		return null;
	}

	const basicAuthToken = Buffer.from(`${SERVER_USER}:${SERVER_PASS}`).toString(
		"base64",
	);

	return {
		...headers,
		Authorization: `Basic ${basicAuthToken}`,
	};
}

export async function GET(request) {
	try {
		const authHeaders = getApiAuthHeaders();

		if (!authHeaders) {
			return NextResponse.json(
				{
					error:
						"CTA rooms API authentication headers are not configured. Verify WEB_API_HEADER_KEY, WEB_API_TOKEN and non-production basic auth credentials",
				},
				{ status: 500 },
			);
		}

		const outboundHeaders = {
			Accept: "application/json",
			...authHeaders,
		};
		const outboundUrl = new URL(CTA_ROOMS_URL);
		const inboundCountry = request.headers.get("x-client-country");

		Object.entries(GEO_QUERY_PARAM_MAP).forEach(([headerName, queryParamName]) => {
			const headerValue = request.headers.get(headerName);

			if (headerValue) {
				outboundUrl.searchParams.set(queryParamName, headerValue);
			}
		});

		const response = await fetch(outboundUrl, {
			method: "GET",
			headers: outboundHeaders,
			cache: "no-store",
		});

		if (!response.ok) {
			return NextResponse.json(
				{
					error: "Failed to fetch CTA rooms data",
				},
				{ status: response.status },
			);
		}

		const data = await response.json();

		return NextResponse.json(
			{
				country: data?.country ?? inboundCountry ?? null,
				cta: data?.cta ?? null,
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
				},
			},
		);
	} catch {
		return NextResponse.json(
			{
				error: "Unexpected error fetching CTA rooms data",
			},
			{ status: 500 },
		);
	}
}
