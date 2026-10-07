"use client";

import clsx from "clsx";
import { useBookingWidget } from "../store/BookingWidgetContext";
import { BOOKING_WIDGET_RENDER_MODE } from "../utils/renderMode";
import { useDictionaryScope } from "@/lib/i18n/ScopedDictionaryProvider";

const TAB_LABELS = {
	"hotel": "btn_hotel",
	"hotel + flight": "btn_hotel_flight",
};

const DEFAULT_OPTIONS = ["hotel", "hotel + flight"];
const TABS_LAYOUT_VARIANT = {
	DEFAULT: "default",
	HORIZONTAL: "horizontal",
};

function BookingWidgetTabs({
	className,
	options = DEFAULT_OPTIONS,
	layoutVariant = TABS_LAYOUT_VARIANT.DEFAULT,
}) {
	const { t = {} } = useDictionaryScope("utils.BookingWidget.components.Tabs");
	const { booking, updateBooking, renderMode } = useBookingWidget();
	const isSurfaceMode = renderMode === BOOKING_WIDGET_RENDER_MODE.SURFACE;
	const isHorizontalLayout = layoutVariant === TABS_LAYOUT_VARIANT.HORIZONTAL;

	return (
		<div
			data-slot="tabs"
			className={clsx(
				"booking-widget-toggle-OK rounded-sm inline-flex flex-row md:flex-col items-stretch overflow-hidden w-max max-w-[60%] min-w-fit",
				isHorizontalLayout ? "booking-widget-toggle-layout-horizontal !w-full !max-w-none !min-w-0 !flex-row" : "!w-full",
				isSurfaceMode
					? "booking-widget-toggle-surface-OK bg-alt-default p-1"
					: "booking-widget-toggle-inverse-OK border p-1 bg-white/8 backdrop-blur-[10px] border-white/45",
				className
			)}
		>
			{options.map((option) => {
				const isActive = booking.type === option;
				const buttonClassName = isActive
					? "booking-widget-toggle-option-active-OK active bg-white"
					: isSurfaceMode
						? "bg-transparent hover:bg-secondary/90"
						: "bg-transparent hover:bg-white/15";

				const labelClassName = isActive
					? "text-secondary font-medium"
					: isSurfaceMode
						? "text-secondary group-hover:text-white"
						: "text-white/90 group-hover:text-white";

				return (
					<button
						key={option}
						type="button"
						aria-pressed={isActive}
						onClick={() => updateBooking("type", option)}
						className={clsx(
							"booking-widget-toggle-option-OK group",
							isActive ? "booking-widget-toggle-option-active-OK active bg-white" :
								isSurfaceMode ? "bg-transparent hover:bg-secondary/90" : "bg-transparent hover:bg-white/15",
							"booking-widget-toggle-option font-light py-1 px-2 rounded-xs cursor-pointer transition-colors duration-300 ease-in-out group",
							isHorizontalLayout ? "booking-widget-toggle-option-layout-horizontal-OK !py-4 !flex-1 !flex !items-center !justify-center" : "!flex-1",
						)}
					>
						<span
							className={clsx(
								"font-futura text-[14px] w-max leading-normal tracking-[2px] uppercase",
								"group-[.active]:text-secondary group-[.active]:font-medium",
								isHorizontalLayout && "w-full text-center",
								isSurfaceMode ? "text-secondary group-hover:text-white group-[.active]:text-secondary" : "text-white/90 text-group-[.active]:text-secondary"
							)}
						>
							{t[TAB_LABELS[option]] || option}
						</span>
					</button>
				);
			})}
		</div>
	);
}

export default BookingWidgetTabs;
