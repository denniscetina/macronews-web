"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function normalizeVh(value) {
	const parsedValue = Number.parseFloat(value);

	if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
		return 100;
	}

	return parsedValue;
}

export default function useScrollSentinel({ vh = 100, enabled = true } = {}) {
	const [hasPassedThreshold, setHasPassedThreshold] = useState(false);
	const sentinelRef = useRef(null);
	const resolvedVh = useMemo(() => normalizeVh(vh), [vh]);
	const sentinelStyle = useMemo(() => ({ height: `${resolvedVh}vh` }), [resolvedVh]);

	useEffect(() => {
		if (!enabled) {
			setHasPassedThreshold(false);
			return undefined;
		}

		if (typeof window === "undefined") {
			return undefined;
		}

		const updateFromScroll = () => {
			setHasPassedThreshold(window.scrollY >= window.innerHeight * (resolvedVh / 100));
		};
		const sentinel = sentinelRef.current;

		if (!sentinel || !("IntersectionObserver" in window)) {
			updateFromScroll();
			window.addEventListener("scroll", updateFromScroll, { passive: true });
			window.addEventListener("resize", updateFromScroll);

			return () => {
				window.removeEventListener("scroll", updateFromScroll);
				window.removeEventListener("resize", updateFromScroll);
			};
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setHasPassedThreshold(!entry.isIntersecting);
			},
			{ threshold: 0 },
		);

		observer.observe(sentinel);

		return () => {
			observer.unobserve(sentinel);
			observer.disconnect();
		};
	}, [enabled, resolvedVh]);

	return {
		hasPassedThreshold,
		sentinelRef,
		sentinelStyle,
	};
}
