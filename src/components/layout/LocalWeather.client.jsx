"use client";

import { useEffect, useState } from "react";

function PinIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 shrink-0 fill-none stroke-primary stroke-[1.5]">
			<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
	);
}

const POSITION_OPTIONS = { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 };

/**
 * Weather of the reader's location in the top bar. The page is cached (ISR) and the same for everyone, so the server
 * renders the default city (Cancún) only as a placeholder that keeps the width, invisible. The browser then asks for its
 * position (the permission prompt is the reader's choice) and `/api/weather?lat=&lon=` answers the weather and the name of
 * that place. While the permission is still undecided, or if the reader denies it or the browser has no geolocation, the place the
 * edge detects from the IP (`/api/weather`) is shown instead, or the default city when that is not available either.
 * @param {{ initial: { label: string, temperature: number, condition: string }, conditions: Record<string, string>, label: string, yourLocation: string, lang: string }} props
 */
export default function LocalWeather({ initial, conditions, label, yourLocation, lang }) {
	const [state, setState] = useState({ weather: initial, ready: false });
	useEffect(() => {
		const controller = new AbortController();
		const show = (weather) => setState({ weather: weather ? { ...weather, label: weather.label || yourLocation } : initial, ready: true });
		const request = (query) =>
			fetch(`/api/weather${query}`, { signal: controller.signal })
				.then((response) => (response.ok ? response.json() : null))
				.then((data) => show(data?.weather ?? null))
				.catch((error) => {
					if (error.name !== "AbortError") {
						show(null);
					}
				});
		const byIp = () => request("");
		const byBrowser = () =>
			navigator.geolocation.getCurrentPosition(
				({ coords }) => request(`?${new URLSearchParams({ lat: coords.latitude.toFixed(4), lon: coords.longitude.toFixed(4), lang })}`),
				// Denied, unavailable or too slow: the place of the IP (when it was not already shown).
				() => byIp(),
				POSITION_OPTIONS,
			);

		if (!("geolocation" in navigator)) {
			byIp();
		} else if (navigator.permissions?.query) {
			navigator.permissions
				.query({ name: "geolocation" })
				.then((permission) => {
					if (permission.state === "granted") {
						byBrowser();
					} else if (permission.state === "denied") {
						byIp();
					} else {
						// Undecided: show the IP place now and ask; the answer replaces it if the reader accepts.
						byIp();
						navigator.geolocation.getCurrentPosition(({ coords }) => request(`?${new URLSearchParams({ lat: coords.latitude.toFixed(4), lon: coords.longitude.toFixed(4), lang })}`), () => {}, POSITION_OPTIONS);
					}
				})
				.catch(byIp);
		} else {
			byBrowser();
		}
		return () => controller.abort();
	}, [initial, yourLocation, lang]);
	const { weather, ready } = state;
	return (
		<p className={`hidden items-center gap-2 truncate sm:flex ${ready ? "" : "invisible"}`} aria-label={label} aria-hidden={!ready}>
			<PinIcon />
			{weather.label} · {weather.temperature}°C {conditions[weather.condition]}
		</p>
	);
}
