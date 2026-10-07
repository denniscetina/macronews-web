import { useCallback, useEffect, useState } from "react";

const getTransitionDirection = (activeIndex, nextIndex, totalItems) => {
	if (totalItems <= 1 || activeIndex === nextIndex) {
		return 1;
	}

	if (activeIndex === totalItems - 1 && nextIndex === 0) {
		return 1;
	}

	if (activeIndex === 0 && nextIndex === totalItems - 1) {
		return -1;
	}

	return nextIndex > activeIndex ? 1 : -1;
};

export default function usePopupSlider({ totalItems, resetKey }) {
	const [activeIndex, setActiveIndex] = useState(0);
	const [slideDirection, setSlideDirection] = useState(1);

	useEffect(() => {
		const resetTimeoutId = window.setTimeout(() => {
			setActiveIndex(0);
			setSlideDirection(1);
		}, 0);

		return () => {
			window.clearTimeout(resetTimeoutId);
		};
	}, [resetKey]);

	useEffect(() => {
		if (activeIndex < totalItems) {
			return undefined;
		}

		const clampTimeoutId = window.setTimeout(() => {
			setActiveIndex(0);
		}, 0);

		return () => {
			window.clearTimeout(clampTimeoutId);
		};
	}, [activeIndex, totalItems]);

	const goToIndex = useCallback(
		(nextIndex) => {
			if (totalItems <= 1 || nextIndex === activeIndex) {
				return;
			}

			const normalizedIndex = ((nextIndex % totalItems) + totalItems) % totalItems;

			setSlideDirection(
				getTransitionDirection(activeIndex, normalizedIndex, totalItems),
			);
			setActiveIndex(normalizedIndex);
		},
		[activeIndex, totalItems],
	);

	const goToNext = useCallback(() => {
		if (totalItems <= 1) {
			return;
		}

		setSlideDirection(1);
		setActiveIndex((previousIndex) => (previousIndex + 1) % totalItems);
	}, [totalItems]);

	const goToPrevious = useCallback(() => {
		if (totalItems <= 1) {
			return;
		}

		setSlideDirection(-1);
		setActiveIndex(
			(previousIndex) => (previousIndex - 1 + totalItems) % totalItems,
		);
	}, [totalItems]);

	return {
		activeIndex,
		slideDirection,
		goToIndex,
		goToNext,
		goToPrevious,
	};
}
