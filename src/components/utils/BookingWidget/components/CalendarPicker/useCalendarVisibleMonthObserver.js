import { useEffect, useState } from "react";

const DAY_PICKER_ROOT_SELECTOR = ".root-day-picker";
const DAY_PICKER_MONTH_SELECTOR = ".rdp-month";
const DAY_PICKER_CAPTION_SELECTOR = ".rdp-caption_label";
const BOTTOM_SHEET_CONTENT_SELECTOR = ".booking-bottom-sheet-content";

function resolveObservationRoot({ isBottomSheetMode, popoverRef }) {
	if (typeof document === "undefined") {
		return null;
	}

	if (isBottomSheetMode) {
		return document.querySelector(BOTTOM_SHEET_CONTENT_SELECTOR);
	}

	return popoverRef?.current ?? null;
}

export default function useCalendarVisibleMonthObserver({
	isEnabled,
	isBottomSheetMode,
	popoverRef,
}) {
	const [visibleMonth, setVisibleMonth] = useState(null);

	useEffect(() => {
		if (!isEnabled || typeof window === "undefined") {
			return undefined;
		}

		let observer = null;
		let observedMonths = [];
		let frameIdA = null;
		let frameIdB = null;

		const setupObserver = () => {
			const observationRoot = resolveObservationRoot({ isBottomSheetMode, popoverRef });
			if (!observationRoot) {
				return;
			}

			const dayPickerRoot = observationRoot.querySelector(DAY_PICKER_ROOT_SELECTOR);
			if (!dayPickerRoot) {
				return;
			}

			observedMonths = Array.from(
				dayPickerRoot.querySelectorAll(DAY_PICKER_MONTH_SELECTOR),
			);
			if (observedMonths.length === 0) {
				return;
			}

			observer = new IntersectionObserver(
				(entries) => {
					const visibleEntries = entries.filter((entry) => entry.isIntersecting);
					if (visibleEntries.length === 0) {
						return;
					}

					const mostVisibleEntry = visibleEntries.reduce((previous, current) =>
						current.intersectionRatio > previous.intersectionRatio ? current : previous,
					);
					const caption = mostVisibleEntry.target.querySelector(
						DAY_PICKER_CAPTION_SELECTOR,
					);
					const monthText = caption?.textContent?.trim();
					if (monthText) {
						setVisibleMonth(monthText);
					}
				},
				{
					root: observationRoot,
					threshold: [0.35, 0.5, 0.75],
				},
			);

			observedMonths.forEach((month) => observer?.observe(month));
		};

		frameIdA = window.requestAnimationFrame(() => {
			frameIdB = window.requestAnimationFrame(setupObserver);
		});

		return () => {
			if (frameIdA) {
				window.cancelAnimationFrame(frameIdA);
			}
			if (frameIdB) {
				window.cancelAnimationFrame(frameIdB);
			}

			observedMonths.forEach((month) => observer?.unobserve(month));
			observer?.disconnect();
		};
	}, [isBottomSheetMode, isEnabled, popoverRef]);

	return visibleMonth;
}
