"use client";
import { useEffect } from "react";
import useScrollSentinel from "@/hooks/useScrollSentinel";
import { useHeaderState } from "@/components/layout/Navigation/HeaderStateContext";

export default function HeaderWrapper({ children, sentinelVh = 100 }) {
	const { isHeaderActive, setScrollHeaderActive } = useHeaderState();

	const { hasPassedThreshold, sentinelRef, sentinelStyle } = useScrollSentinel({
		vh: sentinelVh
	});

	useEffect(() => {
		setScrollHeaderActive(hasPassedThreshold);

		return () => {
			setScrollHeaderActive(false);
		};
	}, [hasPassedThreshold, setScrollHeaderActive]);

	return (
		<div className="relative">
			<div
				ref={sentinelRef}
				aria-hidden
				style={sentinelStyle}
				className="absolute top-0 w-full pointer-events-none"
			/>
			<div className={`group/header ${isHeaderActive ? "active" : ""} ${hasPassedThreshold ? "" : "passive"}`}>
				{children}
			</div>
		</div>
	);
}
