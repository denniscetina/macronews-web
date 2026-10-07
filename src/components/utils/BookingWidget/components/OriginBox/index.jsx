"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { useBookingWidget } from "../../store/BookingWidgetContext";
import { BOOKING_WIDGET_RENDER_MODE } from "../../utils/renderMode";
import { useDictionaryScope } from "@/lib/i18n/ScopedDictionaryProvider";
import {
	MIN_QUERY_LENGTH,
	ORIGIN_BOX_OVERLAY_KEY,
	SEARCH_DEBOUNCE_MS,
} from "./constants";
import useOriginBoxModel from "./useOriginBoxModel";
import useOriginBoxPopover from "./useOriginBoxPopover";
import OriginBoxField from "./OriginBoxField";
import OriginBoxOptionsDropdown from "./OriginBoxOptionsDropdown";
import OriginBoxBottomSheetShell from "./OriginBoxBottomSheetShell";

const ORIGIN_BOX_INTERACTION_MODE = {
	POPOVER: "popover",
	BOTTOM_SHEET: "bottom-sheet",
};

export default function BookingWidgetOriginBox({
	className,
	placeholder,
	isDisabled = false,
	interactionMode = ORIGIN_BOX_INTERACTION_MODE.POPOVER,
}) {
	const { t = {} } = useDictionaryScope("utils.BookingWidget.components.OriginBox");
	const {
		booking,
		isBootstrapLoading,
		updateBooking,
		renderMode,
		isMxMarket,
		airportsOptions,
		activeOverlay,
		openOverlay,
		closeOverlay,
	} = useBookingWidget();
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [draftSearchTerm, setDraftSearchTerm] = useState("");
	const [draftOptions, setDraftOptions] = useState([]);
	const [isDraftLoading, setIsDraftLoading] = useState(false);
	const [draftSelectedOption, setDraftSelectedOption] = useState(null);

	const model = useOriginBoxModel({
		booking,
		isBootstrapLoading,
		isDisabled,
		isMxMarket,
		updateBooking,
		activeOverlay,
		openOverlay,
		closeOverlay,
	});

	const {
		dropdownDirection,
		dropdownMaxHeight,
		containerRef,
		triggerRef,
		dropdownRef,
	} = useOriginBoxPopover({
		isDropdownOpen: model.isDropdownOpen,
		onClose: model.handleCloseDropdown,
	});

	const isSurfaceMode = renderMode === BOOKING_WIDGET_RENDER_MODE.SURFACE;
	const resolvedPlaceholder =
		placeholder || t.lbl_type_origin || "Select an origin";
	const isBottomSheetMode =
		interactionMode === ORIGIN_BOX_INTERACTION_MODE.BOTTOM_SHEET;
	const resolvedOriginLabelFromOptions =
		airportsOptions.find((option) => option.value === booking.origin)?.label || "";
	const currentOriginLabel =
		booking.originLabel || resolvedOriginLabelFromOptions || resolvedPlaceholder;
	const trimmedDraftSearchTerm = draftSearchTerm.trim();
	const draftHasEnoughCharacters =
		trimmedDraftSearchTerm.length >= MIN_QUERY_LENGTH;
	const draftMinCharsText = useMemo(
		() => `Type at least ${MIN_QUERY_LENGTH} characters`,
		[],
	);

	useEffect(() => {
		if (!isBottomSheetMode || !isSheetOpen) {
			return undefined;
		}

		if (!draftHasEnoughCharacters || draftSelectedOption) {
			return undefined;
		}

		let isSubscribed = true;
		const controller = new AbortController();
		const timeoutId = window.setTimeout(async () => {
			setIsDraftLoading(true);

			try {
				const market = isMxMarket ? "mx" : "international";
				const response = await fetch(
					`/api/airports?q=${encodeURIComponent(trimmedDraftSearchTerm)}&market=${market}`,
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

				setDraftOptions(items);
			} catch (error) {
				if (error?.name === "AbortError") {
					return;
				}

				if (!isSubscribed) {
					return;
				}

				setDraftOptions([]);
			} finally {
				if (isSubscribed) {
					setIsDraftLoading(false);
				}
			}
		}, SEARCH_DEBOUNCE_MS);

		return () => {
			isSubscribed = false;
			controller.abort();
			window.clearTimeout(timeoutId);
		};
	}, [
		draftHasEnoughCharacters,
		draftSelectedOption,
		isBottomSheetMode,
		isMxMarket,
		isSheetOpen,
		trimmedDraftSearchTerm,
	]);

	const openSheet = () => {
		setDraftSearchTerm(booking.originLabel || resolvedOriginLabelFromOptions || "");
		setDraftOptions([]);
		setDraftSelectedOption(null);
		setIsDraftLoading(false);
		setIsSheetOpen(true);
	};

	const closeSheet = () => {
		setIsSheetOpen(false);
	};

	const applySheet = () => {
		if (!draftSelectedOption?.value) {
			setIsSheetOpen(false);
			return;
		}
		updateBooking("origin", draftSelectedOption.value);
		updateBooking(
			"originLabel",
			draftSelectedOption.label ||
				draftSelectedOption.city ||
				draftSelectedOption.airportName ||
				draftSelectedOption.value,
		);
		setIsSheetOpen(false);
	};

	if (isBottomSheetMode) {
		if (booking.type !== "hotel + flight") {
			return null;
		}

		return (
			<OriginBoxBottomSheetShell
				className={className}
				label={t.lbl_origin || "Origin"}
				summaryLabel={currentOriginLabel}
				isSurfaceMode={isSurfaceMode}
				isOpen={isSheetOpen}
				onOpen={openSheet}
				onClose={closeSheet}
				onApply={applySheet}
				isApplyDisabled={!draftSelectedOption?.value}
				applyLabel={t.btn_accept || "Accept"}
				height="80vh"
				maxHeight="80vh"
			>
				<div className="flex flex-col gap-2 overflow-y-auto">
					<OriginBoxField
						label={t.lbl_origin || "Origin"}
						isSurfaceMode={isSurfaceMode}
						isDisabledState={isDisabled || isBootstrapLoading}
						searchTerm={draftSearchTerm}
						placeholder={resolvedPlaceholder}
						isLoading={isDraftLoading}
						selectedOption={draftSelectedOption}
						minCharsText={draftMinCharsText}
						hasEnoughCharacters={draftHasEnoughCharacters}
						onFocus={() => {}}
						onInputChange={(event) => {
							const nextValue = event.target.value;
							setDraftSearchTerm(nextValue);
							setDraftSelectedOption(null);
							setIsDraftLoading(false);
							if (nextValue.trim().length < MIN_QUERY_LENGTH) {
								setDraftOptions([]);
							}
						}}
						onToggleOptions={() => {}}
					/>

					{draftHasEnoughCharacters && (
						<div className="--max-h-[42vh] overflow-y-auto border px-2 md:px-0 border-secondary/10 bg-white">
							{draftOptions.length === 0 && !isDraftLoading ? (
								<div className="px-4 py-3 font-futura text-sm text-secondary/70">
									No results found
								</div>
							) : (
								<ul>
									{draftOptions.map((option, index) => (
										<li key={`${index}-${option.value}-${option.code}`} className="group">
											<button
												type="button"
												onClick={() => {
													setIsDraftLoading(false);
													setDraftSelectedOption(option);
													setDraftSearchTerm(
														option.label ||
															option.city ||
															option.airportName ||
															option.value,
													);
												}}
												className={clsx(
													"w-full text-left px-4 py-3 border-b border-secondary/10 group-last:border-b-0 hover:bg-accent transition-colors duration-150 cursor-pointer",
													(draftSelectedOption?.value === option.value) && "bg-accent"
												)}
											>
												<div className="flex items-start justify-between gap-3">
													<div className="flex-1">
														<p className="font-futura text-secondary text-lg leading-[20px] font-medium">
															{option.label}
														</p>
														{option.subtitle && (
															<p className="mt-1 font-futura text-[#4e5772] text-sm leading-[20px]">
																{option.subtitle}
															</p>
														)}
													</div>
													<span className="mt-1 shrink-0 rounded-[4px] bg-[#d9dbe2] px-2.5 py-1 text-[14px] leading-[14px] font-futura text-secondary">
														{option.code}
													</span>
												</div>
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					)}
				</div>
			</OriginBoxBottomSheetShell>
		);
	}

	if (booking.type !== "hotel + flight") {
		return null;
	}

	return (
		<div
			data-slot="origin-box"
			ref={containerRef}
			className={clsx("booking-widget-field flex flex-col py-2 w-full", className)}
		>
			<OriginBoxField
				ref={triggerRef}
				label={t.lbl_origin || "Origin"}
				isSurfaceMode={isSurfaceMode}
				isDisabledState={model.isDisabledState}
				searchTerm={model.searchTerm}
				placeholder={resolvedPlaceholder}
				isLoading={model.isLoading}
				selectedOption={model.selectedOption}
				minCharsText={model.minCharsText}
				hasEnoughCharacters={model.hasEnoughCharacters}
				onFocus={model.handleFocus}
				onInputChange={model.handleInputChange}
				onToggleOptions={model.handleToggleOptions}
			/>

			<OriginBoxOptionsDropdown
				isDropdownOpen={
					activeOverlay === ORIGIN_BOX_OVERLAY_KEY && model.isDropdownOpen
				}
				dropdownRef={dropdownRef}
				dropdownDirection={dropdownDirection}
				dropdownMaxHeight={dropdownMaxHeight}
				options={model.options}
				onSelectOption={model.handleSelectOption}
			/>
		</div>
	);
}
