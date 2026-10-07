"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FALLBACK_IDLE_DELAY_MS = 1200;
const IDLE_TIMEOUT_MS = 2000;

const PopupOffersClient = dynamic(() => import("./PopupOffers.client"), {
	ssr: false,
	loading: () => null,
});

export default function PopupOffersDeferred(props) {
	const [shouldMount, setShouldMount] = useState(false);

	useEffect(() => {
		let timeoutId;
		let idleId;

		const mount = () => {
			setShouldMount(true);
		};

		if (typeof window !== "undefined" && "requestIdleCallback" in window) {
			idleId = window.requestIdleCallback(mount, { timeout: IDLE_TIMEOUT_MS });
		} else {
			timeoutId = window.setTimeout(mount, FALLBACK_IDLE_DELAY_MS);
		}

		return () => {
			if (typeof idleId === "number" && "cancelIdleCallback" in window) {
				window.cancelIdleCallback(idleId);
			}

			if (typeof timeoutId === "number") {
				window.clearTimeout(timeoutId);
			}
		};
	}, []);

	if (!shouldMount) {
		return null;
	}

	return <PopupOffersClient {...props} />;
}
