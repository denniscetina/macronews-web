"use client";
import { motion } from "framer-motion";
import clsx from "clsx";
import BookingWidget from "./index";
import { useBookingWidget } from "./store/BookingWidgetContext";
import { BOOKING_WIDGET_RENDER_MODE } from "./utils/renderMode";

function BookingWidgetHeroContent() {
	const { booking } = useBookingWidget();
	const showOrigin = booking.type === "hotel + flight";

	return (
		<BookingWidget.Panel className={clsx("w-full h-auto flex flex-col $max-w-[1920px] max-w-max",
			showOrigin ? "$max-w-[1280px]" : "$max-w-[1080px]"
			)}>
			<div className="booking-widget-hero-fields-row">
				<div className={
					clsx("booking-widget-hero-field-tabs min-w-0 self-stretch flex overflow-hidden",
					showOrigin ? "justify-center" : ""
					)
				}>
					<BookingWidget.Tabs className="w-full" />
				</div>

				<motion.div
					layout
					transition={{
						duration: 0.5,
						ease: "easeInOut",
					}}
					className={clsx(
						"booking-widget-hero-inputs-grid transition-[grid-template-columns] duration-500 ease-in",
						showOrigin
							? "booking-widget-hero-inputs-grid-flight"
							: "booking-widget-hero-inputs-grid-hotel",
					)}
				>
					{showOrigin && (
						<motion.div
							layout
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							className="booking-widget-hero-input-cell booking-widget-hero-field-origin">
							<BookingWidget.OriginBox />
						</motion.div>
					)}

					<motion.div layout="position" className="booking-widget-hero-input-cell booking-widget-hero-field-date">
						<BookingWidget.CalendarPicker mode="range" />
					</motion.div>

					<motion.div layout="position" className="booking-widget-hero-input-cell booking-widget-hero-field-guests-rooms">
						<BookingWidget.GuestsRooms />
					</motion.div>
				</motion.div>

				<div className="booking-widget-hero-submit-wrap">
					<BookingWidget.Submit />
				</div>
			</div>
		</BookingWidget.Panel>
	);
}

export default function BookingWidgetHero({
	renderMode = BOOKING_WIDGET_RENDER_MODE.INVERSE,
}) {
	return (
		<BookingWidget renderMode={renderMode} className="booking-widget-hero-root hidden md:flex justify-center transition-all duration-300 ease-out">
			<BookingWidgetHeroContent />
		</BookingWidget>
	);
}
