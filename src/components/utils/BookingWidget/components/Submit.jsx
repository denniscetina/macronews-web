"use client";

import dayjs from "dayjs";
import clsx from "clsx";
import { useMemo } from "react";
import { useBookingWidget } from "../store/BookingWidgetContext";
import { useDictionaryScope } from "@/lib/i18n/ScopedDictionaryProvider";

const normalizeParameters = (parameters) => {
	if (Array.isArray(parameters)) {
		return parameters.reduce((accumulator, parameter) => {
			if (!parameter?.key) {
				return accumulator;
			}

			accumulator[parameter.key] =
				parameter.defaultValue ?? parameter.default ?? "";

			return accumulator;
		}, {});
	}

	if (parameters && typeof parameters === "object") {
		return Object.entries(parameters).reduce((accumulator, [key, value]) => {
			if (value && typeof value === "object") {
				accumulator[key] = value.defaultValue ?? value.default ?? "";
				return accumulator;
			}

			accumulator[key] = value ?? "";
			return accumulator;
		}, {});
	}

	return {};
};

const normalizeParameterFormats = (parameters) => {
	if (Array.isArray(parameters)) {
		return parameters.reduce((accumulator, parameter) => {
			if (!parameter?.key) {
				return accumulator;
			}

			accumulator[parameter.key] =
				typeof parameter.format === "string" ? parameter.format : "";

			return accumulator;
		}, {});
	}

	if (parameters && typeof parameters === "object") {
		return Object.entries(parameters).reduce((accumulator, [key, value]) => {
			if (value && typeof value === "object") {
				accumulator[key] = typeof value.format === "string" ? value.format : "";
				return accumulator;
			}

			accumulator[key] = "";
			return accumulator;
		}, {});
	}

	return {};
};

const resolveDayjsFormat = (format) => {
	const normalizedFormat =
		typeof format === "string" ? format.trim().toLowerCase() : "";

	if (normalizedFormat === "dd-mmm-yy") {
		return "DD-MMM-YY";
	}

	return "YYYY-MM-DD";
};

const formatDateSafe = (value, requestedFormat) => {
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		const dayjsFormat = resolveDayjsFormat(requestedFormat);
		return dayjs(value).locale("en").format(dayjsFormat);
	}

	if (typeof value === "string" && value.trim() !== "") {
		const parsed = dayjs(value);
		const dayjsFormat = resolveDayjsFormat(requestedFormat);
		return parsed.isValid() ? parsed.locale("en").format(dayjsFormat) : "";
	}

	return "";
};

const calculateRoomDistribution = ({ rooms = 1, guests = 1 }) => {
	const parsedRooms = Number(rooms);
	const parsedGuests = Number(guests);

	if (
		!Number.isFinite(parsedRooms) ||
		!Number.isFinite(parsedGuests) ||
		parsedRooms <= 0 ||
		parsedGuests <= 0 ||
		parsedGuests < parsedRooms
	) {
		return null;
	}

	const baseGuests = Math.floor(parsedGuests / parsedRooms);
	const remaining = parsedGuests % parsedRooms;
	const distribution = Array.from({ length: parsedRooms }, () => baseGuests);

	for (let index = 0; index < remaining; index += 1) {
		distribution[index] += 1;
	}

	return distribution.join("!");
};

const replaceTemplateValues = (template, values) => {
	if (!template) {
		return "";
	}

	let resolvedTemplate = String(template);

	Object.entries(values).forEach(([key, value]) => {
		resolvedTemplate = resolvedTemplate.replaceAll(
			`{${key}}`,
			String(value ?? ""),
		);
	});

	return resolvedTemplate.replace(/\{[^}]+\}/g, "");
};

const joinBaseAndPath = (baseUrl, pathTemplate) => {
	if (!baseUrl) {
		return "";
	}

	if (!pathTemplate) {
		return baseUrl;
	}

	if (pathTemplate.startsWith("?")) {
		return `${baseUrl}${pathTemplate}`;
	}

	if (baseUrl.endsWith("/") && pathTemplate.startsWith("/")) {
		return `${baseUrl}${pathTemplate.slice(1)}`;
	}

	if (!baseUrl.endsWith("/") && !pathTemplate.startsWith("/")) {
		return `${baseUrl}/${pathTemplate}`;
	}

	return `${baseUrl}${pathTemplate}`;
};

const resolveBootstrapDates = (settings, minimumStayNights) => {
	const today = dayjs().startOf("day");
	const arrivalOffsetDays = Number.parseInt(
		settings?.invalidOrMissingArrivalDateRuleDays,
		10,
	);
	const resolvedArrivalOffsetDays =
		Number.isFinite(arrivalOffsetDays) && arrivalOffsetDays >= 0
			? arrivalOffsetDays
			: 0;
	const arrivalCandidate = dayjs(settings?.defaultArrivalDate);
	let arrivalDate = arrivalCandidate.isValid() ? arrivalCandidate : today;

	const departureCandidate = dayjs(settings?.defaultDepartureDate);
	let departureDate =
		departureCandidate.isValid() && departureCandidate.isAfter(arrivalDate, "day")
			? departureCandidate
			: dayjs(arrivalDate).add(minimumStayNights, "day");

	if (
		today.isAfter(arrivalDate, "day") ||
		(today.isSame(arrivalDate, "day") && resolvedArrivalOffsetDays > 0)
	) {
		arrivalDate = dayjs(today).add(resolvedArrivalOffsetDays, "day");
		departureDate = dayjs(arrivalDate).add(minimumStayNights, "day");
	}

	return {
		arrival: arrivalDate.toDate(),
		departure: departureDate.toDate(),
	};
};

function BookingWidgetSubmit({
	className,
	disabled = false,
	onClick,
	label,
	labelClassName,
}) {
	const { t = {} } = useDictionaryScope("utils.BookingWidget.components.Submit");
	const resolvedLabel = label || t.btn_reserva || "Reserve my stay";
	const {
		booking,
		bootstrapData,
		bootstrapSettings,
		isBootstrapLoading,
		updateDates,
	} = useBookingWidget();
	const minimumStayNights = useMemo(() => {
		const parsed = Number.parseInt(bootstrapSettings?.minimumStayNights, 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 4;
	}, [bootstrapSettings?.minimumStayNights]);
	const shouldUseBootstrapDates = booking.hasSelectedDates !== true;
	const bootstrapDates = useMemo(
		() => resolveBootstrapDates(bootstrapSettings, minimumStayNights),
		[bootstrapSettings, minimumStayNights],
	);
	const effectiveArrival = shouldUseBootstrapDates
		? bootstrapDates.arrival
		: booking.arrival;
	const effectiveDeparture = shouldUseBootstrapDates
		? bootstrapDates.departure
		: booking.departure;

	const isBookingComplete =
		effectiveArrival &&
		effectiveDeparture &&
		booking.guests &&
		booking.rooms &&
		(booking.type === "hotel" || booking.origin);

	const flightDistribution = useMemo(() => {
		if (booking.type !== "hotel + flight") {
			return "";
		}

		return calculateRoomDistribution({
			rooms: booking.rooms,
			guests: booking.guests,
		});
	}, [booking.type, booking.rooms, booking.guests]);

	const bookingUrl = useMemo(() => {
		const bookingOptions =
			booking.type === "hotel"
				? bootstrapData?.options?.hotel
				: bootstrapData?.options?.hotelFlight;

		if (!bookingOptions?.baseUrl) {
			return "";
		}

		const defaults = normalizeParameters(bookingOptions.parameters);
		const parameterFormats = normalizeParameterFormats(bookingOptions.parameters);

		const dynamicValues = {
			adult: booking.guests,
			adults: booking.guests,
			arrive: formatDateSafe(effectiveArrival, parameterFormats.arrive),
			arrival: formatDateSafe(effectiveArrival, parameterFormats.arrival),
			adate: formatDateSafe(effectiveArrival, parameterFormats.adate),
			checkin: formatDateSafe(effectiveArrival, parameterFormats.checkin),
			depart: formatDateSafe(effectiveDeparture, parameterFormats.depart),
			departure: formatDateSafe(effectiveDeparture, parameterFormats.departure),
			ddate: formatDateSafe(effectiveDeparture, parameterFormats.ddate),
			checkout: formatDateSafe(effectiveDeparture, parameterFormats.checkout),
			rooms: booking.rooms,
			origin: booking.origin || defaults.origin,
			airport: booking.origin || defaults.airport,
			pc: booking.promoCode,
		};

		if (booking.type === "hotel + flight" && flightDistribution) {
			dynamicValues.distribution = flightDistribution;
		}

		const templateValues = {
			...defaults,
			...dynamicValues,
		};

		const resolvedPathTemplate = replaceTemplateValues(
			bookingOptions.pathTemplate,
			templateValues,
		);

		return joinBaseAndPath(bookingOptions.baseUrl, resolvedPathTemplate).replace(
			/&amp;/g,
			"&",
		);
	}, [
		bootstrapData,
		booking,
		flightDistribution,
		effectiveArrival,
		effectiveDeparture,
	]);

	const isDisabledSubmit =
		disabled ||
		isBootstrapLoading ||
		!isBookingComplete ||
		!bookingUrl ||
		(booking.type === "hotel + flight" && !flightDistribution);

	const handleSubmitClick = () => {

		if (isDisabledSubmit) {
			return;
		}

		if (shouldUseBootstrapDates) {
			updateDates(bootstrapDates.arrival, bootstrapDates.departure);
		}

		onClick?.(booking, bookingUrl);

		window.dataLayer = window.dataLayer || [];
		window.dataLayer.push({
			event: "booking_click",
			element_id: "unico-dominio",
			"data-source-origin": "booking-start",
		});

		window.open(bookingUrl, "_blank", "noopener,noreferrer");
	};

	return (
		<button
			type="button"
			data-slot="submit"
			onClick={handleSubmitClick}
			disabled={isDisabledSubmit}
			id="unico-dominio"
			data-source-origin="booking-start"
			className={clsx("booking-widget-submit", className)}
		>
			<span className={clsx("booking-widget-submit-label", labelClassName)}>
				{resolvedLabel}
			</span>
		</button>
	);
}

export default BookingWidgetSubmit;
