import dayjs from "dayjs";
import { useMemo, useState } from "react";
import {
	DEFAULT_CALENDAR_STAY_NIGHTS,
	CALENDAR_ACCENT_COLOR,
	CALENDAR_RANGE_BACKGROUND,
} from "./constants";
import { formatRangeLabel, toValidDate } from "./utils";

export default function useCalendarPickerModel({
	booking,
	updateBooking,
	updateDates,
	today,
	departurePlaceholder,
	closeCalendar,
	locale
}) {
	const [navigatedMonth, setNavigatedMonth] = useState(null);
	const hasSelectedDates = booking.hasSelectedDates === true;

	const startDate = useMemo(() => {
		if (!hasSelectedDates) {
			return today;
		}

		const arrival = toValidDate(booking.arrival);
		return arrival ?? today;
	}, [booking.arrival, hasSelectedDates, today]);

	const endDate = useMemo(() => {
		if (!hasSelectedDates) {
			return dayjs(today).add(DEFAULT_CALENDAR_STAY_NIGHTS, "day").toDate();
		}

		const departure = toValidDate(booking.departure);

		if (departure && dayjs(departure).isAfter(dayjs(startDate), "day")) {
			return departure;
		}

		return null;
	}, [booking.departure, hasSelectedDates, startDate, today]);

	const selectedRange = useMemo(() => {
		if (!startDate) return undefined;
		if (!endDate) return { from: startDate };
		return { from: startDate, to: endDate };
	}, [startDate, endDate]);

	const visibleMonth = useMemo(() => {
		if (navigatedMonth instanceof Date && !Number.isNaN(navigatedMonth.getTime())) {
			return navigatedMonth;
		}

		return dayjs(startDate ?? today).startOf("month").toDate();
	}, [navigatedMonth, startDate, today]);

	const rangeLabel = useMemo(
		() =>
			formatRangeLabel({
				arrival: startDate,
				departure: endDate,
				departurePlaceholder,
				locale
			}),
		[startDate, endDate, departurePlaceholder],
	);

	const dayPickerThemeStyles = useMemo(
		() => ({
			"--rdp-accent-color": CALENDAR_ACCENT_COLOR,
			"--rdp-accent-background-color": CALENDAR_RANGE_BACKGROUND,
			"--rdp-selected-border": `2px solid ${CALENDAR_ACCENT_COLOR}`,
			"--rdp-today-color": CALENDAR_ACCENT_COLOR,
		}),
		[],
	);

	const dayPickerModifiersStyles = useMemo(
		() => ({
			selected: {
				backgroundColor: "bg-primary",
				color: "text-primary",
				fontWeight: 700,
			},
			rangeStart: {
				background: "bg-primary",
				color: "text-primary",
			},
			rangeEnd: {
				background: `linear-gradient(90deg, ${CALENDAR_RANGE_BACKGROUND} 50%, transparent 50%)`,
				color: "text-primary",
			},
			range: {
				backgroundColor: CALENDAR_RANGE_BACKGROUND,
				color: "text-primary",
			},
		}),
		[],
	);

	const handleRangeChange = (range) => {
		if (!range) {
			return;
		}

		const { from, to } = range;

		if (!(from instanceof Date) || Number.isNaN(from.getTime())) {
			return;
		}

		const normalizedArrival = dayjs(from).toDate();

		if (!(to instanceof Date) || Number.isNaN(to.getTime())) {
			updateDates(normalizedArrival, "");
			updateBooking("hasSelectedDates", true);
			return;
		}

		const normalizedDeparture = dayjs(to).toDate();

		updateDates(normalizedArrival, normalizedDeparture);
		updateBooking("hasSelectedDates", true);
		closeCalendar();
	};

	const syncNavigatedMonthWithSelection = () => {
		setNavigatedMonth(dayjs(startDate ?? today).startOf("month").toDate());
	};

	return {
		startDate,
		endDate,
		selectedRange,
		visibleMonth,
		navigatedMonth,
		setNavigatedMonth,
		rangeLabel,
		dayPickerThemeStyles,
		dayPickerModifiersStyles,
		handleRangeChange,
		syncNavigatedMonthWithSelection,
	};
}
