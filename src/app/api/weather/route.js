import { NextResponse } from "next/server";
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

/**
 * GET /api/weather: weather where the reader is (the city and coordinates the edge adds to the request), for the top
 * bar. Without them (local development, no proxy, the managed transform off) it answers the configured default city
 * with `located: false`, so the bar still shows something. Answers `private, no-store`.
 */
export async function GET(request) {
	const city = decode(pick(request.headers, HEADERS.city));
	const latitude = Number(pick(request.headers, HEADERS.latitude));
	const longitude = Number(pick(request.headers, HEADERS.longitude));
	const located = Boolean(city) && Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 && (latitude !== 0 || longitude !== 0);
	// Coordinates are rounded to 2 decimals (~1 km): enough for the weather and they share the fetch cache.
	const weather = located ? await getWeather({ label: city, latitude: Math.round(latitude * 100) / 100, longitude: Math.round(longitude * 100) / 100 }) : await getWeather();
	return NextResponse.json({ weather, located: located && Boolean(weather) }, { headers: { "Cache-Control": "private, no-store" } });
}
