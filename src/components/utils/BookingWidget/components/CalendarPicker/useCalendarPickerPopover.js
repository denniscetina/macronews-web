import { useCallback, useEffect, useRef, useState } from "react";

export default function useCalendarPickerPopover({
	isCalendarOpen,
	closeCalendar,
}) {
	const containerRef = useRef(null);
	const triggerRef = useRef(null);
	const popoverRef = useRef(null);
	const [popoverDirection, setPopoverDirection] = useState("down");
	const [popoverMaxHeight, setPopoverMaxHeight] = useState(null);
	const [isPopoverReady, setIsPopoverReady] = useState(false);

	const closePopover = useCallback(() => {
		setPopoverDirection("down");
		setPopoverMaxHeight(null);
		setIsPopoverReady(false);
		closeCalendar();
	}, [closeCalendar]);

	const recalculatePopoverPosition = useCallback(() => {
		if (!triggerRef.current || !popoverRef.current || typeof window === "undefined") {
			return;
		}

		const VIEWPORT_MARGIN = 12;
		const TRIGGER_GAP = 8;
		const MIN_POPOVER_HEIGHT = 260;
		const triggerRect = triggerRef.current.getBoundingClientRect();
		const popoverHeight = popoverRef.current.offsetHeight;
		const viewportHeight = window.innerHeight;
		const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_MARGIN;
		const spaceAbove = triggerRect.top - VIEWPORT_MARGIN;
		const shouldOpenUp =
			spaceBelow < popoverHeight + TRIGGER_GAP && spaceAbove > spaceBelow;
		const availableSpace = shouldOpenUp ? spaceAbove : spaceBelow;

		setPopoverDirection(shouldOpenUp ? "up" : "down");
		setPopoverMaxHeight(Math.max(MIN_POPOVER_HEIGHT, availableSpace - TRIGGER_GAP));
	}, []);

	useEffect(() => {
		if (!isCalendarOpen) {
			return undefined;
		}

		const handleClickOutside = (event) => {
			if (!containerRef.current?.contains(event.target)) {
				closePopover();
			}
		};

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				closePopover();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [closePopover, isCalendarOpen]);

	useEffect(() => {
		if (!isCalendarOpen) {
			return undefined;
		}

		const rafId = window.requestAnimationFrame(() => {
			recalculatePopoverPosition();
			setIsPopoverReady(true);
		});

		return () => {
			window.cancelAnimationFrame(rafId);
		};
	}, [isCalendarOpen, recalculatePopoverPosition]);

	useEffect(() => {
		if (!isCalendarOpen) {
			return undefined;
		}

		window.addEventListener("resize", recalculatePopoverPosition);
		window.addEventListener("scroll", recalculatePopoverPosition, true);

		return () => {
			window.removeEventListener("resize", recalculatePopoverPosition);
			window.removeEventListener("scroll", recalculatePopoverPosition, true);
		};
	}, [isCalendarOpen, recalculatePopoverPosition]);

	return {
		containerRef,
		triggerRef,
		popoverRef,
		popoverDirection,
		popoverMaxHeight,
		isPopoverReady,
		setIsPopoverReady,
		closePopover,
	};
}
