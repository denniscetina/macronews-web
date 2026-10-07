"use client";

import clsx from "clsx";
import { BookingWidgetProvider } from "../store/BookingWidgetContext";
import {
	BOOKING_WIDGET_RENDER_MODE,
	normalizeRenderMode,
} from "../utils/renderMode";

function BookingWidgetRoot({
	children,
	className,
	initialBooking = null,
	onChange,
	renderMode = BOOKING_WIDGET_RENDER_MODE.SURFACE,
}) {
	const normalizedRenderMode = normalizeRenderMode(renderMode);
	const renderModeClassName =
		normalizedRenderMode === BOOKING_WIDGET_RENDER_MODE.INVERSE
			? "booking-widget-mode-inverse"
			: "booking-widget-mode-surface";

	return (
		<BookingWidgetProvider
			initialBooking={initialBooking}
			onChange={onChange}
			renderMode={normalizedRenderMode}
		>
			<div
				data-booking-widget-render-mode={normalizedRenderMode}
				className={clsx("#w-full", renderModeClassName, className)}
			>
				{children}
			</div>
		</BookingWidgetProvider>
	);
}

export default BookingWidgetRoot;
