import { NextResponse } from "next/server";
import { getPlaceName } from "@/server/services/widgets/place";
import { getWeather } from "@/server/services/widgets/weather";

/** Headers of the reader's request that carry the location (Cloudflare first, then Vercel). */
const HEADERS = {
	city: ["cf-ipcity", "x-vercel-ip-city"],
	latitude: ["cf-iplatitude", "x-vercel-ip-latitude"],
	longitude: ["cf-iplongitude", "x-vercel-ip-longitude"],
};

const pick = (headers, names) => names.map((name) => headers.get(name)).find(Boolean) ?? "";

/**
 * Vercel sends the city URL-encoded; Cloudflare sends raw UTF-8 bytes, which Node reads as latin1 ("MÃ©rida"), so they
 * are read again as UTF-8 when that gives a valid text.
 */
function decode(value) {
	let text = value;
	try {
		text = decodeURIComponent(value);
	} catch {
		// Not URL-encoded: keep it as it came.
	}
	const utf8 = Buffer.from(text, "latin1").toString("utf8");
	return (utf8.includes("\uFFFD") ? text : utf8).trim().slice(0, 60);
}

const validCoordinates = (latitude, longitude) =>
	Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 && (latitude !== 0 || longitude !== 0);

/** ~1 km: enough for the weather, and the places share the caches. */
const round = (value) => Math.round(value * 100) / 100;

/**
 * GET /api/weather: weather where the reader is, for the top bar.
 * - `?lat=&lon=`: the position the reader's browser gave (they accepted the permission prompt). Rounded to ~1 km, named with
 *   `getPlaceName` (`label` is "" when it cannot be named) and never stored.
 * - Without them: the city and coordinates the edge adds to the request (the fallback when the reader denies the permission).
 *   Without those either (local development, no proxy, the managed transform off) it answers the configured default city with
 *   `located: false`, so the bar still shows something.
 * Answers `private, no-store`.
 */
export async function GET(request) {
	const query = request.nextUrl.searchParams;
	const browserLatitude = query.has("lat") ? Number(query.get("lat")) : Number.NaN;
	const browserLongitude = query.has("lon") ? Number(query.get("lon")) : Number.NaN;
	if (validCoordinates(browserLatitude, browserLongitude)) {
		const latitude = round(browserLatitude);
		const longitude = round(browserLongitude);
		const lang = /^[a-z]{2,3}$/.test(query.get("lang") ?? "") ? query.get("lang") : "es";
		const label = await getPlaceName(latitude, longitude, lang);
		const weather = await getWeather({ label, latitude, longitude });
		return NextResponse.json({ weather, located: Boolean(weather), source: "browser" }, { headers: { "Cache-Control": "private, no-store" } });
	}

	const city = decode(pick(request.headers, HEADERS.city));
	const latitude = Number(pick(request.headers, HEADERS.latitude));
	const longitude = Number(pick(request.headers, HEADERS.longitude));
	const located = Boolean(city) && validCoordinates(latitude, longitude);
	const weather = located ? await getWeather({ label: city, latitude: round(latitude), longitude: round(longitude) }) : await getWeather();
	return NextResponse.json({ weather, located: located && Boolean(weather), source: "edge" }, { headers: { "Cache-Control": "private, no-store" } });
}
