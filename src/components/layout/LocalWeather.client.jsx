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

/**
 * Weather of the reader's location in the top bar. The page is cached (ISR) and the same for everyone, so the server
 * renders the default city (Cancún) only as a placeholder that keeps the width, invisible; the browser asks
 * `/api/weather` (city and coordinates from the edge headers) and shows the reader's place, or the default city when
 * the location is not available or the request fails.
 * @param {{ initial: { label: string, temperature: number, condition: string }, conditions: Record<string, string>, label: string }} props
 */
export default function LocalWeather({ initial, conditions, label }) {
	const [state, setState] = useState({ weather: initial, ready: false });
	useEffect(() => {
		const controller = new AbortController();
		fetch("/api/weather", { signal: controller.signal })
			.then((response) => (response.ok ? response.json() : null))
			.then((data) => setState({ weather: data?.weather ?? initial, ready: true }))
			.catch((error) => {
				if (error.name !== "AbortError") {
					setState({ weather: initial, ready: true });
				}
			});
		return () => controller.abort();
	}, [initial]);
	const { weather, ready } = state;
	return (
		<p className={`hidden items-center gap-2 truncate sm:flex ${ready ? "" : "invisible"}`} aria-label={label} aria-hidden={!ready}>
			<PinIcon />
			{weather.label} · {weather.temperature}°C {conditions[weather.condition]}
		</p>
	);
}
