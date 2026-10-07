"use client";

import { useSyncExternalStore } from "react";

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function subscribeToMobileViewport(onStoreChange) {
	const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

	mediaQuery.addEventListener("change", onStoreChange);

	return () => {
		mediaQuery.removeEventListener("change", onStoreChange);
	};
}

function getMobileViewportSnapshot() {
	return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

export default function useIsMobile() {
	return useSyncExternalStore(
		subscribeToMobileViewport,
		getMobileViewportSnapshot,
		() => false,
	);
}
