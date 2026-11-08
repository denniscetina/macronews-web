import "server-only";
import { WEATHER, WIDGET_TIMEOUT_MS } from "@/config/widgets";

/** WMO weather code -> key of `dictionary.layout.weather`. */
function conditionOf(code) {
	if (code === 0) return "clear";
	if (code === 1) return "mostlyClear";
	if (code === 2) return "partlyCloudy";
	if (code === 3) return "cloudy";
	if (code === 45 || code === 48) return "fog";
	if (code >= 51 && code <= 57) return "drizzle";
	if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
	if (code >= 71 && code <= 77) return "snow";
	if (code >= 95) return "thunderstorm";
	return "cloudy";
}

/**
 * Current weather of a place (Open-Meteo); the configured city when none is given. Returns null when the service
 * fails, so the top bar just omits the widget.
 * @param {{ label: string, latitude: number, longitude: number, timezone?: string }} [place]
 * @returns {Promise<{ label: string, temperature: number, condition: string } | null>}
 */
export async function getWeather(place = WEATHER) {
	try {
		const url = new URL("https://api.open-meteo.com/v1/forecast");
		url.search = new URLSearchParams({
			latitude: String(place.latitude),
			longitude: String(place.longitude),
			current: "temperature_2m,weather_code",
			timezone: place.timezone ?? "auto",
		}).toString();
		const response = await fetch(url, { next: { revalidate: WEATHER.revalidate }, signal: AbortSignal.timeout(WIDGET_TIMEOUT_MS) });
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}`);
		}
		const { current } = await response.json();
		if (!Number.isFinite(current?.temperature_2m)) {
			throw new Error("unexpected payload");
		}
		return { label: place.label, temperature: Math.round(current.temperature_2m), condition: conditionOf(current.weather_code) };
	} catch (error) {
		console.error("[weather] could not load the weather:", error.message);
		return null;
	}
}
