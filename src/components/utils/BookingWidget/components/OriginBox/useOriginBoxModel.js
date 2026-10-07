import { useEffect, useMemo, useState } from "react";
import {
	MIN_QUERY_LENGTH,
	ORIGIN_BOX_OVERLAY_KEY,
	SEARCH_DEBOUNCE_MS,
} from "./constants";

export default function useOriginBoxModel({
	booking,
	isBootstrapLoading,
	isDisabled,
	isMxMarket,
	updateBooking,
	activeOverlay,
	openOverlay,
	closeOverlay,
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [options, setOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const trimmedSearchTerm = searchTerm.trim();
	const hasEnoughCharacters = trimmedSearchTerm.length >= MIN_QUERY_LENGTH;
	const isDisabledState = isDisabled || isBootstrapLoading;
	const isDropdownOpen =
		activeOverlay === ORIGIN_BOX_OVERLAY_KEY &&
		hasEnoughCharacters &&
		options.length > 0;

	const minCharsText = useMemo(
		() => `Type at least ${MIN_QUERY_LENGTH} characters`,
		[],
	);

	useEffect(() => {
		if (booking.type === "hotel + flight") {
			return;
		}

		setSearchTerm("");
		setOptions([]);
		setSelectedOption(null);
		setIsLoading(false);
		closeOverlay(ORIGIN_BOX_OVERLAY_KEY);
	}, [booking.type, closeOverlay]);

	useEffect(() => {
		if (!booking.origin) {
			setSelectedOption(null);
			return;
		}

		const nextLabel = booking.originLabel || "";
		if (nextLabel && searchTerm !== nextLabel) {
			setSearchTerm(nextLabel);
		}
	}, [booking.origin, booking.originLabel, searchTerm]);

	useEffect(() => {
		if (
			isDisabledState ||
			!hasEnoughCharacters ||
			booking.type !== "hotel + flight" ||
			selectedOption !== null
		) {
			closeOverlay(ORIGIN_BOX_OVERLAY_KEY);
			return;
		}

		let isSubscribed = true;
		const controller = new AbortController();
		const timeoutId = window.setTimeout(async () => {
			setIsLoading(true);

			try {
				const market = isMxMarket ? "mx" : "international";
				const response = await fetch(
					`/api/airports?q=${encodeURIComponent(trimmedSearchTerm)}&market=${market}`,
					{
						method: "GET",
						headers: {
							Accept: "application/json",
						},
						cache: "no-store",
						signal: controller.signal,
					},
				);

				if (!response.ok) {
					throw new Error("Failed to fetch airports");
				}

				const payload = await response.json();
				const items = Array.isArray(payload?.items) ? payload.items : [];

				if (!isSubscribed) {
					return;
				}

				setOptions(items);
				if (items.length > 0) {
					openOverlay(ORIGIN_BOX_OVERLAY_KEY);
				} else {
					closeOverlay(ORIGIN_BOX_OVERLAY_KEY);
				}
			} catch (error) {
				if (error?.name === "AbortError") {
					return;
				}

				if (!isSubscribed) {
					return;
				}

				setOptions([]);
				closeOverlay(ORIGIN_BOX_OVERLAY_KEY);
			} finally {
				if (isSubscribed) {
					setIsLoading(false);
				}
			}
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			isSubscribed = false;
			controller.abort();
			window.clearTimeout(timeoutId);
		};
	}, [
		booking.type,
		closeOverlay,
		hasEnoughCharacters,
		isDisabledState,
		isMxMarket,
		openOverlay,
		selectedOption,
		trimmedSearchTerm,
	]);

	const handleFocus = () => {
		if (hasEnoughCharacters && options.length > 0) {
			openOverlay(ORIGIN_BOX_OVERLAY_KEY);
		}
	};

	const handleInputChange = (event) => {
		const nextValue = event.target.value;
		setSearchTerm(nextValue);
		if (booking.origin) {
			updateBooking("origin", "");
			updateBooking("originLabel", "");
		}

		if (nextValue.trim().length < MIN_QUERY_LENGTH) {
			setOptions([]);
			setSelectedOption(null);
			closeOverlay(ORIGIN_BOX_OVERLAY_KEY);
		}
	};

	const handleToggleOptions = () => {
		if (isDropdownOpen) {
			closeOverlay(ORIGIN_BOX_OVERLAY_KEY);
			return;
		}

		if (hasEnoughCharacters && options.length > 0) {
			openOverlay(ORIGIN_BOX_OVERLAY_KEY);
		}
	};

	const handleCloseDropdown = () => {
		closeOverlay(ORIGIN_BOX_OVERLAY_KEY);
	};

	const handleSelectOption = (option) => {
		updateBooking("origin", option.value);
		updateBooking("originLabel", option.label || option.city || option.airportName || option.value);
		setSelectedOption(option);
		setSearchTerm(option.label || option.city || option.airportName);
		closeOverlay(ORIGIN_BOX_OVERLAY_KEY);
	};

	return {
		searchTerm,
		options,
		isLoading,
		selectedOption,
		hasEnoughCharacters,
		isDropdownOpen,
		isDisabledState,
		minCharsText,
		handleFocus,
		handleInputChange,
		handleToggleOptions,
		handleSelectOption,
		handleCloseDropdown,
	};
}
