"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { normalizeRenderMode } from "../utils/renderMode";
import { useSiteInit } from "@/context/SiteInitProvider";

const DEFAULT_STAY_NIGHTS = 4;

export const DEFAULT_BOOKING_WIDGET_STATE = {
	type: "hotel",
	origin: "",
	originLabel: "",
	arrival: "",
	departure: "",
	promoCode: "",
	guests: 2,
	rooms: 1,
	hasSelectedDates: false,
};

const BookingWidgetContext = createContext(null);

const sanitizeNumber = (value, fallback) => {
	const num = Number(value);
	return Number.isFinite(num) ? num : fallback;
};

const toPositiveInt = (value, fallback) => {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const toISODateString = (value) => {
	if (typeof value !== "string" || value.trim() === "") {
		return "";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toISOString().slice(0, 10);
};

const getParameterDefaultValue = (parameters, key) => {
	if (Array.isArray(parameters)) {
		const found = parameters.find((parameter) => parameter?.key === key);
		return found?.defaultValue;
	}

	if (parameters && typeof parameters === "object") {
		const rawParameter = parameters[key];

		if (rawParameter && typeof rawParameter === "object") {
			return rawParameter.defaultValue ?? rawParameter.default;
		}

		return rawParameter;
	}

	return undefined;
};

const addDaysToISODateString = (isoDateString, days) => {
	const date = new Date(isoDateString);
	if (Number.isNaN(date.getTime())) {
		return "";
	}

	date.setDate(date.getDate() + days);
	return date.toISOString().slice(0, 10);
};

const normalizeSiteInitForBookingWidget = (siteInitPayload) => {
	const bookingWidget = siteInitPayload?.booking?.widget;

	if (!bookingWidget || typeof bookingWidget !== "object") {
		return null;
	}

	const defaultAirport = bookingWidget.defaultAirport;
	const airports = Array.isArray(bookingWidget.airports)
		? bookingWidget.airports
		: defaultAirport && typeof defaultAirport === "object"
			? [defaultAirport]
			: [];

	return {
		...bookingWidget,
		airports,
		market: siteInitPayload?.market?.marketCode ?? "",
		geo: siteInitPayload?.geo ?? null,
	};
};

const applyBootstrapDefaults = (booking, bootstrapData) => {
	if (!bootstrapData || typeof bootstrapData !== "object") {
		return booking;
	}

	const settings = bootstrapData.settings ?? {};
	const hotelParameters = bootstrapData.options?.hotel?.parameters;
	const minimumStayNights = toPositiveInt(
		settings.minimumStayNights,
		DEFAULT_STAY_NIGHTS,
	);

	const defaultArrival = toISODateString(settings.defaultArrivalDate);
	const defaultDeparture = toISODateString(settings.defaultDepartureDate);

	const nextBooking = { ...booking };

	if (!nextBooking.arrival && defaultArrival) {
		nextBooking.arrival = defaultArrival;
	}

	if (!nextBooking.departure) {
		if (defaultDeparture) {
			nextBooking.departure = defaultDeparture;
		} else if (nextBooking.arrival) {
			nextBooking.departure = addDaysToISODateString(
				nextBooking.arrival,
				minimumStayNights,
			);
		}
	}

	if (nextBooking.guests === DEFAULT_BOOKING_WIDGET_STATE.guests) {
		nextBooking.guests = Math.max(
			1,
			toPositiveInt(
				getParameterDefaultValue(hotelParameters, "adult"),
				DEFAULT_BOOKING_WIDGET_STATE.guests,
			),
		);
	}

	if (nextBooking.rooms === DEFAULT_BOOKING_WIDGET_STATE.rooms) {
		nextBooking.rooms = Math.max(
			1,
			toPositiveInt(
				getParameterDefaultValue(hotelParameters, "rooms"),
				DEFAULT_BOOKING_WIDGET_STATE.rooms,
			),
		);
	}

	return nextBooking;
};

export function BookingWidgetProvider({
	children,
	initialBooking,
	onChange,
	renderMode,
}) {
	const { siteInitData, isSiteInitLoading, siteInitError } = useSiteInit();
	const normalizedRenderMode = useMemo(
		() => normalizeRenderMode(renderMode),
		[renderMode],
	);

	const mergedInitialState = useMemo(
		() => ({ ...DEFAULT_BOOKING_WIDGET_STATE, ...(initialBooking ?? {}) }),
		[initialBooking],
	);
	const [booking, setBooking] = useState(mergedInitialState);
	const [activeOverlay, setActiveOverlay] = useState(null);

	const bootstrapData = useMemo(() => {
		if (!siteInitData) {
			return null;
		}

		return normalizeSiteInitForBookingWidget(siteInitData);
	}, [siteInitData]);

	const isBootstrapLoading = isSiteInitLoading;

	const bootstrapError = useMemo(() => {
		if (siteInitError) {
			return "Failed to load booking widget bootstrap data";
		}

		if (!isSiteInitLoading && !bootstrapData) {
			return "Failed to load booking widget bootstrap data";
		}

		return null;
	}, [siteInitError, isSiteInitLoading, bootstrapData]);

	const resolvedBooking = useMemo(() => {
		if (!bootstrapData || booking.hasSelectedDates) {
			return booking;
		}

		return applyBootstrapDefaults(booking, bootstrapData);
	}, [booking, bootstrapData]);

	const updateBooking = useCallback((key, value) => {
		setBooking((prev) => {
			const next = { ...prev };

			switch (key) {
				case "type":
					if (value === "hotel" || value === "hotel + flight") {
						next.type = value;
						if (value === "hotel + flight") {
							next.origin = "";
							next.originLabel = "";
							next.rooms = 1;
						}
						if (value === "hotel") {
							next.promoCode = "";
							next.origin = "";
							next.originLabel = "";
						}
					}
					break;
				case "origin":
					if (typeof value === "string") {
						next.origin = value;
						if (!value.trim()) {
							next.originLabel = "";
						}
					}
					break;
				case "originLabel":
				case "promoCode":
					if (typeof value === "string") {
						next[key] = value;
					}
					break;
				case "arrival":
				case "departure":
					if (
						(value instanceof Date && !Number.isNaN(value.getTime())) ||
						(typeof value === "string" && value.trim() !== "")
					) {
						next[key] = value;
					}
					break;
				case "guests":
					next.guests = Math.max(1, sanitizeNumber(value, prev.guests));
					break;
				case "rooms":
					next.rooms = Math.max(1, sanitizeNumber(value, prev.rooms));
					break;
				case "hasSelectedDates":
					if (typeof value === "boolean") {
						next.hasSelectedDates = value;
					}
					break;
				default:
					break;
			}

			return next;
		});
	}, []);

	const updateDates = useCallback((arrival, departure) => {
		setBooking((prev) => ({
			...prev,
			arrival,
			departure,
		}));
	}, []);

	const openOverlay = useCallback((overlayKey) => {
		if (typeof overlayKey !== "string" || overlayKey.trim() === "") {
			return;
		}

		setActiveOverlay(overlayKey);
	}, []);

	const closeOverlay = useCallback((overlayKey) => {
		setActiveOverlay((previousKey) => {
			if (!overlayKey) {
				return null;
			}

			return previousKey === overlayKey ? null : previousKey;
		});
	}, []);

	const resetBooking = useCallback(() => {
		setBooking(mergedInitialState);
		setActiveOverlay(null);
	}, [mergedInitialState]);

	useEffect(() => {
		onChange?.(resolvedBooking);
	}, [resolvedBooking, onChange]);

	const isMxMarket = useMemo(() => {
		const market = String(
			bootstrapData?.options?.hotel?.marketResolved ?? bootstrapData?.market ?? "",
		).toLowerCase();
		const countryCode = String(bootstrapData?.geo?.countryCode ?? "").toLowerCase();

		return market === "mx" || countryCode === "mx";
	}, [bootstrapData]);

	const airportsOptions = useMemo(() => {
		const airports = Array.isArray(bootstrapData?.airports)
			? bootstrapData.airports
			: [];

		return airports.map((airport) => ({
			value: airport.airportCode,
			label: airport.airportName,
			countryCode: airport.countryCode,
			city: airport.city,
		}));
	}, [bootstrapData]);

	const value = useMemo(
		() => ({
			booking: resolvedBooking,
			renderMode: normalizedRenderMode,
			updateBooking,
			updateDates,
			activeOverlay,
			openOverlay,
			closeOverlay,
			resetBooking,
			bootstrapData,
			bootstrapSettings: bootstrapData?.settings ?? null,
			airportsOptions,
			isMxMarket,
			isBootstrapLoading,
			bootstrapError,
		}),
		[
			resolvedBooking,
			normalizedRenderMode,
			updateBooking,
			updateDates,
			activeOverlay,
			openOverlay,
			closeOverlay,
			resetBooking,
			bootstrapData,
			airportsOptions,
			isMxMarket,
			isBootstrapLoading,
			bootstrapError,
		],
	);

	return (
		<BookingWidgetContext.Provider value={value}>
			{children}
		</BookingWidgetContext.Provider>
	);
}

export function useBookingWidget() {
	const context = useContext(BookingWidgetContext);

	if (!context) {
		throw new Error("useBookingWidget must be used within a BookingWidgetProvider");
	}

	return context;
}
