"use client";

import clsx from "clsx";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { DayPicker, getDefaultClassNames, UI } from "react-day-picker";
import { es as esLocaleDayPicker } from "react-day-picker/locale";
import "react-day-picker/style.css";
import IconCalendar from "./IconCalendar";
import { useBookingWidget } from "../../store/BookingWidgetContext";
import { BOOKING_WIDGET_RENDER_MODE } from "../../utils/renderMode";
import { useDictionaryScope } from "@/lib/i18n/ScopedDictionaryProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
	CALENDAR_INTERACTION_MODE,
	CALENDAR_LAYOUT_VARIANT,
	CALENDAR_MONTHS_LAYOUT,
	CALENDAR_OVERLAY_KEY,
} from "./constants";
import useCalendarPickerModel from "./useCalendarPickerModel";
import useCalendarPickerPopover from "./useCalendarPickerPopover";
import CalendarPickerBottomSheetShell from "./CalendarPickerBottomSheetShell";
//import useCalendarVisibleMonthObserver from "./useCalendarVisibleMonthObserver";

const isValidDate = (value) =>
	value instanceof Date && !Number.isNaN(value.getTime());

export default function CalendarPicker({
	className,
	mode = "range",
	layoutVariant = CALENDAR_LAYOUT_VARIANT.DEFAULT,
	monthsLayout = CALENDAR_MONTHS_LAYOUT.HORIZONTAL,
	interactionMode = CALENDAR_INTERACTION_MODE.POPOVER,
}) {
	const defaultClassNames = getDefaultClassNames();
	const { t = {}, locale } = useDictionaryScope("utils.BookingWidget.components.CalendarPicker");
	const {
		booking,
		updateBooking,
		updateDates,
		renderMode,
		activeOverlay,
		openOverlay,
		closeOverlay,
	} = useBookingWidget();
	const hasUnderlineLayout = layoutVariant === CALENDAR_LAYOUT_VARIANT.UNDERLINE;
	const isVerticalMonths = monthsLayout === CALENDAR_MONTHS_LAYOUT.VERTICAL;
	const isSurfaceMode = renderMode === BOOKING_WIDGET_RENDER_MODE.SURFACE;
	const isBottomSheetMode =
		interactionMode === CALENDAR_INTERACTION_MODE.BOTTOM_SHEET;
	const isCalendarOpen = activeOverlay === CALENDAR_OVERLAY_KEY;
	const labelClassName = clsx(
		"booking-widget-label",
		isSurfaceMode && "booking-widget-label-surface",
	);
	const today = useMemo(() => dayjs().startOf("day").toDate(), []);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [draftRange, setDraftRange] = useState(undefined);
	const [draftNavigatedMonth, setDraftNavigatedMonth] = useState(null);

	const closeCalendar = useCallback(() => {
		closeOverlay(CALENDAR_OVERLAY_KEY);
	}, [closeOverlay]);

	const {
		containerRef,
		triggerRef,
		popoverRef,
		popoverDirection,
		popoverMaxHeight,
		isPopoverReady,
		setIsPopoverReady,
		closePopover,
	} = useCalendarPickerPopover({
		isCalendarOpen,
		closeCalendar,
	});
	const observerEnabled = isBottomSheetMode ? isSheetOpen : isCalendarOpen;
	/*
	const visibleMonth = useCalendarVisibleMonthObserver({
		isEnabled: observerEnabled,
		isBottomSheetMode,
		popoverRef,
	});
	*/
	const handleClose = useCallback(() => {
		closePopover();
	}, [closePopover]);

	const model = useCalendarPickerModel({
		booking,
		updateBooking,
		updateDates,
		today,
		departurePlaceholder: t.lbl_departure || "Departure",
		closeCalendar: handleClose,
		locale
	});

	const handlePopoverToggle = () => {
		if (isCalendarOpen) {
			handleClose();
		} else {
			model.syncNavigatedMonthWithSelection();
			setIsPopoverReady(false);
			openOverlay(CALENDAR_OVERLAY_KEY);
		}
	};

	const openSheet = useCallback(() => {
		const draftFrom = model.startDate ?? today;
		const draftTo = model.endDate;
		setDraftRange(
			isValidDate(draftTo) ? { from: draftFrom, to: draftTo } : { from: draftFrom },
		);
		setDraftNavigatedMonth(dayjs(draftFrom).startOf("month").toDate());
		setIsSheetOpen(true);
	}, [model.endDate, model.startDate, today]);

	const closeSheet = useCallback(() => {
		setIsSheetOpen(false);
	}, []);

	const applySheet = useCallback(() => {
		if (!draftRange || !isValidDate(draftRange.from)) {
			setIsSheetOpen(false);
			return;
		}

		const normalizedArrival = dayjs(draftRange.from).toDate();
		const normalizedDeparture = isValidDate(draftRange.to)
			? dayjs(draftRange.to).toDate()
			: "";

		updateDates(normalizedArrival, normalizedDeparture);
		updateBooking("hasSelectedDates", true);
		setIsSheetOpen(false);
	}, [draftRange, updateBooking, updateDates]);

	const handleSheetRangeChange = useCallback((range) => {
		if (!range || !isValidDate(range.from)) {
			return;
		}

		setDraftRange(range);
	}, []);

	const sheetVisibleMonth = useMemo(() => {
		if (isValidDate(draftNavigatedMonth)) {
			return draftNavigatedMonth;
		}

		return dayjs(draftRange?.from ?? model.startDate ?? today)
			.startOf("month")
			.toDate();
	}, [draftNavigatedMonth, draftRange?.from, model.startDate, today]);

	const dayPickerCommonProps = {
		navLayout: "around",
		mode,
		resetOnSelect: true,
		disabled: { before: today },
		modifiersClassNames: {
			today: "!text-primary !font-medium",
			selected: "rdp-range_selected-custom",
		},
		classNames: {
			root: `root-day-picker ${defaultClassNames.root} w-full min-w-fit font-futura ${isVerticalMonths ? "bg-white rounded-xs" : ""}`,
			months: clsx(defaultClassNames.months, "flex gap-8 !w-full !max-w-full !flex-nowrap", isVerticalMonths ? "!flex-col" : "!flex-row"),
			month_grid: clsx("w-full"),
			[UI.CaptionLabel]: `${defaultClassNames.caption_label} text-xl capitalize`,
			[UI.Weekday]: `${defaultClassNames.weekday} !capitalize`,
			[UI.Chevron]: `${defaultClassNames.chevron} !fill-primary`,
		},
		styles: model.dayPickerThemeStyles,
		modifiersStyles: model.dayPickerModifiersStyles,
	};

	if (isBottomSheetMode) {
		return (
			<CalendarPickerBottomSheetShell
				className={className}
				label={t.lbl_travel_dates || "Travel Dates"}
				summaryLabel={model.rangeLabel}
				isSurfaceMode={isSurfaceMode}
				isOpen={isSheetOpen}
				onOpen={openSheet}
				onClose={closeSheet}
				onApply={applySheet}
				applyLabel={t.btn_accept || "Accept"}
				maxHeight="80vh"
			>
				<DayPicker
					locale={ locale === "es" ? esLocaleDayPicker : undefined}
					{...dayPickerCommonProps}
					selected={draftRange}
					onSelect={handleSheetRangeChange}
					month={sheetVisibleMonth}
					onMonthChange={setDraftNavigatedMonth}
					hideNavigation={true}
					numberOfMonths={15}
				/>
			</CalendarPickerBottomSheetShell>
		);
	}

	return (
		<div
			data-slot="calendar-picker"
			ref={containerRef}
			className={clsx("booking-widget-field flex flex-col py-2 w-full", className)}
		>
			<span className={labelClassName}>{`${t.lbl_travel_dates || "Travel Dates"}`}</span>
			<div
				ref={triggerRef}
				className="flex items-center w-full relative"
			>
				<div className="relative w-full">
					<button
						type="button"
						onClick={handlePopoverToggle}
						className={clsx(
							"w-full min-h-[38px] font-futura border-0 bg-transparent text-left flex items-center transition-all duration-300 cursor-pointer capitalize",
							hasUnderlineLayout &&
								"border-0 border-b pb-2 rounded-none",
							isSurfaceMode
								? "booking-widget-calendar-range-trigger-surface border-secondary/60 text-secondary"
								: "booking-widget-calendar-range-trigger-inverse border-white/50 text-white",
						)}
					>
						<IconCalendar
							color={isSurfaceMode ? "surface" : "inverse"}
							className="mr-2"
						/>
						{model.rangeLabel}
					</button>
				</div>
			</div>
			<AnimatePresence mode="wait">
				{isCalendarOpen && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 10 }}
						transition={{ duration: 0.1, ease: "easeInOut" }}
						ref={popoverRef}
						style={popoverMaxHeight ? { maxHeight: `${popoverMaxHeight}px` } : undefined}
						className={clsx(
							"absolute w-full flex flex-col bg-white drop-shadow-xl min-w-fit p-2 overflow-y-auto",
							!isPopoverReady && "invisible opacity-0 pointer-events-none",
							popoverDirection === "up"
								? "bottom-full mb-2"
								: "top-full mt-2",
						)}
					>
						<DayPicker
							locale={ locale === "es" ? esLocaleDayPicker : undefined}
							{...dayPickerCommonProps}
							selected={model.selectedRange}
							onSelect={model.handleRangeChange}
							month={model.visibleMonth}
							onMonthChange={model.setNavigatedMonth}
							numberOfMonths={hasUnderlineLayout ? 1 : 2}
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
