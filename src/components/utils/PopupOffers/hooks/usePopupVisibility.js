import { useCallback, useEffect, useState } from "react";

const POPUP_SHOWN_KEY = "popup_ads_shown";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const DEFAULT_POPUP_DELAY_SECONDS = 10;

const toPopupDelayMs = (delayValue) => {
	const parsedDelay = Number(delayValue);

	if (Number.isFinite(parsedDelay) && parsedDelay >= 0) {
		return parsedDelay * 1000;
	}

	return DEFAULT_POPUP_DELAY_SECONDS * 1000;
};

const hasPopupBeenShownRecently = () => {
	if (typeof window === "undefined") {
		return false;
	}

	try {
		const storedTimestamp = window.localStorage.getItem(POPUP_SHOWN_KEY);

		if (!storedTimestamp) {
			return false;
		}

		const lastShownTime = Number.parseInt(storedTimestamp, 10);

		if (Number.isNaN(lastShownTime)) {
			return false;
		}

		return Date.now() - lastShownTime < TWENTY_FOUR_HOURS_MS;
	} catch {
		return false;
	}
};

const markPopupAsShown = () => {
	if (typeof window === "undefined") {
		return;
	}

	try {
		window.localStorage.setItem(POPUP_SHOWN_KEY, Date.now().toString());
	} catch {
		// Ignore localStorage write errors.
	}
};

export default function usePopupVisibility({
	isHydrated,
	isEnabled,
	delayValue,
	resetKey,
}) {
	const [isSuppressed, setIsSuppressed] = useState(() =>
		hasPopupBeenShownRecently(),
	);
	const [visible, setVisible] = useState(false);
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		const resetTimeoutId = window.setTimeout(() => {
			setVisible(false);
			setIsClosing(false);
		}, 0);

		return () => {
			window.clearTimeout(resetTimeoutId);
		};
	}, [resetKey]);

	useEffect(() => {
		if (!isEnabled && visible) {
			const disableTimeoutId = window.setTimeout(() => {
				setVisible(false);
			}, 0);

			return () => {
				window.clearTimeout(disableTimeoutId);
			};
		}

		return undefined;
	}, [isEnabled, visible]);

	useEffect(() => {
		if (!isHydrated || isSuppressed || visible || !isEnabled) {
			return undefined;
		}

		const timeoutId = window.setTimeout(() => {
			setVisible(true);
		}, toPopupDelayMs(delayValue));

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [isHydrated, isSuppressed, visible, isEnabled, delayValue]);

	useEffect(() => {
		if (!visible) {
			return undefined;
		}

		const htmlElement = document.documentElement;
		const previousOverflow = htmlElement.style.overflow;
		htmlElement.style.overflow = "hidden";

		return () => {
			htmlElement.style.overflow = previousOverflow;
		};
	}, [visible]);

	const closePopup = useCallback(() => {
		markPopupAsShown();
		setIsClosing(true);
		setVisible(false);
		setIsSuppressed(true);
	}, []);

	useEffect(() => {
		if (!visible) {
			return undefined;
		}

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				closePopup();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [visible, closePopup]);

	const handleExitComplete = useCallback(() => {
		setIsClosing(false);
	}, []);

	return {
		isSuppressed,
		visible,
		isClosing,
		shouldRenderPortal: visible || isClosing,
		closePopup,
		handleExitComplete,
	};
}
