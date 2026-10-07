import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export default function useGuestsRoomsPopover() {
	const [isOpen, setIsOpen] = useState(false);
	const [popoverDirection, setPopoverDirection] = useState("down");
	const [popoverMaxHeight, setPopoverMaxHeight] = useState(null);
	const containerRef = useRef(null);
	const triggerRef = useRef(null);
	const popoverRef = useRef(null);

	const closePopover = useCallback(() => {
		setIsOpen(false);
		setPopoverDirection("down");
		setPopoverMaxHeight(null);
	}, []);

	const openPopover = useCallback(() => {
		setIsOpen(true);
	}, []);

	const togglePopover = useCallback(() => {
		setIsOpen((previousOpen) => {
			if (previousOpen) {
				setPopoverDirection("down");
				setPopoverMaxHeight(null);
				return false;
			}

			return true;
		});
	}, []);

	useEffect(() => {
		if (!isOpen) {
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
	}, [closePopover, isOpen]);

	const recalculatePopoverPosition = useCallback(() => {
		if (!triggerRef.current || !popoverRef.current || typeof window === "undefined") {
			return;
		}

		const VIEWPORT_MARGIN = 12;
		const TRIGGER_GAP = 10;
		const MIN_POPOVER_HEIGHT = 140;
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

	useLayoutEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const frameId = window.requestAnimationFrame(() => {
			recalculatePopoverPosition();
		});

		return () => window.cancelAnimationFrame(frameId);
	}, [isOpen, recalculatePopoverPosition]);

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		window.addEventListener("resize", recalculatePopoverPosition);
		window.addEventListener("scroll", recalculatePopoverPosition, true);

		return () => {
			window.removeEventListener("resize", recalculatePopoverPosition);
			window.removeEventListener("scroll", recalculatePopoverPosition, true);
		};
	}, [isOpen, recalculatePopoverPosition]);

	return {
		isOpen,
		popoverDirection,
		popoverMaxHeight,
		containerRef,
		triggerRef,
		popoverRef,
		openPopover,
		closePopover,
		togglePopover,
	};
}
