import "server-only";
import { WIDGET_TIMEOUT_MS } from "@/config/widgets";

/**
 * Name of the place at some coordinates (OpenStreetMap Nominatim reverse geocoding), for the top bar weather when the browser
 * gives its position. The coordinates arrive rounded to ~1 km, nothing is stored and the answer is cached a day by place, which
 * also keeps us far below Nominatim's one request per second. Returns "" when it cannot be named: the caller shows a generic label.
 * @param {number} latitude
 * @param {number} longitude
 * @param {string} lang
 */
export async function getPlaceName(latitude, longitude, lang) {
	try {
		const url = new URL("https://nominatim.openstreetmap.org/reverse");
		url.search = new URLSearchParams({ format: "jsonv2", lat: String(latitude), lon: String(longitude), zoom: "10", "accept-language": lang, addressdetails: "1" }).toString();
		const response = await fetch(url, {
			headers: { "User-Agent": "MacronewsWeb/1.0 (weather widget)" },
			next: { revalidate: 86400 },
			signal: AbortSignal.timeout(WIDGET_TIMEOUT_MS),
		});
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const { address } = await response.json();
		const name = address?.city || address?.town || address?.village || address?.municipality || address?.county || address?.state || "";
		return String(name).trim().slice(0, 60);
	} catch (error) {
		console.error("[place] could not name the place:", error.message);
		return "";
	}
}
