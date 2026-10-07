import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export default function useOriginBoxPopover({ isDropdownOpen, onClose }) {
	const [dropdownDirection, setDropdownDirection] = useState("down");
	const [dropdownMaxHeight, setDropdownMaxHeight] = useState(null);
	const containerRef = useRef(null);
	const triggerRef = useRef(null);
	const dropdownRef = useRef(null);

	const recalculatePopoverPosition = useCallback(() => {
		if (!triggerRef.current || !dropdownRef.current || typeof window === "undefined") {
			return;
		}

		const VIEWPORT_MARGIN = 32;
		const TRIGGER_GAP = 32;
		const MIN_POPOVER_HEIGHT = 140;
		const MAX_POPOVER_HEIGHT = 400;
		const triggerRect = triggerRef.current.getBoundingClientRect();
		const popoverHeight = dropdownRef.current.offsetHeight;
		const viewportHeight = window.innerHeight;
		const spaceBelow = viewportHeight - triggerRect.bottom - VIEWPORT_MARGIN;
		const spaceAbove = triggerRect.top - VIEWPORT_MARGIN - 80;
		const shouldOpenUp =
			spaceBelow < popoverHeight + TRIGGER_GAP && spaceAbove > spaceBelow;
		const availableSpace = shouldOpenUp ? spaceAbove : spaceBelow;

		setDropdownDirection(shouldOpenUp ? "up" : "down");
		const calculatedHeight = Math.max(
			MIN_POPOVER_HEIGHT,
			availableSpace - TRIGGER_GAP,
		);
		setDropdownMaxHeight(
			calculatedHeight > MAX_POPOVER_HEIGHT ? MAX_POPOVER_HEIGHT : calculatedHeight,
		);
	}, []);

	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (!containerRef.current?.contains(event.target)) {
				onClose?.();
			}
		};

		document.addEventListener("mousedown", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, [onClose]);

	useLayoutEffect(() => {
		if (!isDropdownOpen) {
			return undefined;
		}

		const frameId = window.requestAnimationFrame(() => {
			recalculatePopoverPosition();
		});

		return () => window.cancelAnimationFrame(frameId);
	}, [isDropdownOpen, recalculatePopoverPosition]);

	useEffect(() => {
		if (!isDropdownOpen) {
			return undefined;
		}

		window.addEventListener("resize", recalculatePopoverPosition);
		window.addEventListener("scroll", recalculatePopoverPosition, true);

		return () => {
			window.removeEventListener("resize", recalculatePopoverPosition);
			window.removeEventListener("scroll", recalculatePopoverPosition, true);
		};
	}, [isDropdownOpen, recalculatePopoverPosition]);

	return {
		dropdownDirection,
		dropdownMaxHeight,
		containerRef,
		triggerRef,
		dropdownRef,
	};
}
