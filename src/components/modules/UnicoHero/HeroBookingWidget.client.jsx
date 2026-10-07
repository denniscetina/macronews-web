"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";
const loadBookingWidgetHero = () =>
	import("@/components/utils/BookingWidget/BookingWidgetHero").then(
		(module) => module.default,
	);

function subscribeToDesktopViewport(onStoreChange) {
	const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

	mediaQuery.addEventListener("change", onStoreChange);

	return () => {
		mediaQuery.removeEventListener("change", onStoreChange);
	};
}

function getDesktopViewportSnapshot() {
	return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
}

export default function HeroBookingWidget() {
	const shouldRender = useSyncExternalStore(
		subscribeToDesktopViewport,
		getDesktopViewportSnapshot,
		() => false,
	);
	const [BookingWidgetHero, setBookingWidgetHero] = useState(null);

	useEffect(() => {
		if (!shouldRender || BookingWidgetHero) {
			return;
		}

		let isMounted = true;

		loadBookingWidgetHero().then((Component) => {
			if (isMounted) {
				setBookingWidgetHero(() => Component);
			}
		});

		return () => {
			isMounted = false;
		};
	}, [BookingWidgetHero, shouldRender]);

	if (!shouldRender || !BookingWidgetHero) {
		return null;
	}

	return <BookingWidgetHero renderMode="inverse" />;
}
