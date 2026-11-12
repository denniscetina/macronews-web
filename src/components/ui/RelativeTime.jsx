"use client";

import { useSyncExternalStore } from "react";
import { shortDate, timeAgo } from "@/lib/relative-time";

const subscribeMinute = (onChange) => {
	const timer = setInterval(onChange, 60000);
	return () => clearInterval(timer);
};

/**
 * Date of a news item as the core asks (NewsCarousel guide 1.3.0): the server prints the plain date ("12 sep", good for SEO and
 * for hydration, since the cached HTML can be hours old) and the browser swaps in the relative text ("Hace 2 horas", "Hoy"...)
 * and refreshes it every minute.
 * @param {{ iso: string | null, labels: Parameters<typeof timeAgo>[1], lang: string, className?: string }} props
 */
export default function RelativeTime({ iso, labels, lang, className }) {
	const text = useSyncExternalStore(
		subscribeMinute,
		() => timeAgo(iso, labels, lang),
		() => shortDate(iso, lang),
	);
	return iso && text ? (
		<time dateTime={iso} className={className}>
			{text}
		</time>
	) : null;
}
