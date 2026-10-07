import { NextResponse } from "next/server";

const BOOKING_WIDGET_BOOTSTRAP_URL = `${process.env.WEB_API_URL}/booking/bootstrap`;
const WEB_API_HEADER_KEY = process.env.WEB_API_HEADER_KEY;
const WEB_API_TOKEN = process.env.WEB_API_TOKEN;
const SERVER_USER = process.env.SERVER_USER;
const SERVER_PASS = process.env.SERVER_PASS ?? process.env.SERVER_PASSWORD;
const IS_PRODUCTION = process.env.APP_ENV === "production";

const GEO_QUERY_PARAM_MAP = {
	country: "country",
	subdivision: "subdivision",
	city: "city",
};

const getHeaderValue = (headers, headerNames) => {
	for (const headerName of headerNames) {
		const value = headers.get(headerName);

		if (typeof value === "string" && value.trim() !== "") {
			return value.trim();
		}
	}

	return null;
};

const getGeoQueryParams = (headers) => {
	const country = getHeaderValue(headers, [
		"cf-ipcountry",
		"http_cf_ipcountry",
		"x-client-country",
		"http_x_client_country",
	]);
	const regionSubdivision = getHeaderValue(headers, [
		"cf-region",
		"http_cf_region",
		"x-client-region-subdivision",
		"http_x_client_region_subdivision",
	]);
	const city = getHeaderValue(headers, [
		"cf-ipcity",
		"http_cf_ipcity",
		"x-client-city",
		"http_x_client_city",
	]);

	const normalizedCountry = country ? country.toUpperCase() : null;

	let normalizedSubdivision = null;

	if (regionSubdivision) {
		let cleanedRegion = regionSubdivision.replaceAll("-", "").toUpperCase();

		if (normalizedCountry && cleanedRegion.startsWith(normalizedCountry)) {
			cleanedRegion = cleanedRegion.slice(normalizedCountry.length);
		}

		normalizedSubdivision = cleanedRegion || null;
	}

	const normalizedCity = city ? city.trim() : null;

	return {
		country: normalizedCountry,
		subdivision: normalizedSubdivision,
		city: normalizedCity,
	};
};

const getApiAuthHeaders = () => {
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
};

export async function GET(request) {
	try {
		const authHeaders = getApiAuthHeaders();

		if (!authHeaders) {
			return NextResponse.json(
				{
					error:
						"Booking widget API authentication headers are not configured. Verify WEB_API_HEADER_KEY, WEB_API_TOKEN and non-production basic auth credentials",
				},
				{ status: 500 },
			);
		}

		const outboundHeaders = {
			Accept: "application/json",
			...authHeaders,
		};
		const outboundUrl = new URL(BOOKING_WIDGET_BOOTSTRAP_URL);
		const geoQueryParams = getGeoQueryParams(request.headers);

		Object.entries(GEO_QUERY_PARAM_MAP).forEach(([geoKey, queryParamName]) => {
			const headerValue = geoQueryParams[geoKey];

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
					error: "Failed to fetch booking widget bootstrap data",
				},
				{ status: response.status },
			);
		}

		const data = await response.json();

		return NextResponse.json(data, {
			status: 200,
			headers: {
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch {
		return NextResponse.json(
			{
				error: "Unexpected error fetching booking widget bootstrap data",
			},
			{ status: 500 },
		);
	}
}
