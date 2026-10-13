"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Today's date in Cancún time. Computed in the browser so the cached (ISR) page never shows
 * yesterday's date; renders empty on the server.
 */
export default function TodayDate({ lang }) {
	const text = useSyncExternalStore(
		subscribe,
		() => new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long", timeZone: "America/Cancun" }).format(new Date()),
		() => "",
	);
	return (
		<time suppressHydrationWarning className="uppercase text-neutral-400">
			{text}
		</time>
	);
}
