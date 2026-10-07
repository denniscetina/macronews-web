"use client";

import BookingWidget from "./index";
import { BOOKING_WIDGET_RENDER_MODE } from "./utils/renderMode";
import { useDictionaryScope } from "@/lib/i18n/ScopedDictionaryProvider";

export default function BookingWidgetMobile({ className }) {
	const { t = {} } = useDictionaryScope("utils.BookingWidget.BookingWidgetMobile");
	const promoToggleLabel = t.lbl_have_promo_code || "Have a promo code?";

	return (
		<BookingWidget
			renderMode={BOOKING_WIDGET_RENDER_MODE.SURFACE}
			className={["w-full", className].filter(Boolean).join(" ")}
		>
			<BookingWidget.Panel className="w-full h-full min-h-0 flex flex-col">
				<div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-6">
					<BookingWidget.Tabs className="w-full" layoutVariant="horizontal" />
					<BookingWidget.OriginBox interactionMode="bottom-sheet" />
					<BookingWidget.CalendarPicker
						className="!w-full overflow-y-auto"
						mode="range"
						layoutVariant="underline"
						interactionMode="bottom-sheet"
						monthsLayout="vertical"
					/>
					<BookingWidget.GuestsRooms
						className="!py-0"
						interactionMode="bottom-sheet"
					/>
				</div>

				<div className="pt-4 bg-alt flex flex-col gap-3">
					<BookingWidget.PromoCode
						className="!py-0"
						isVisible
						interactionMode="bottom-sheet"
						buttonLabel={promoToggleLabel}
					/>
					<BookingWidget.Submit
						label={t.btn_book_now || "Book now"}
						className="w-full !h-[54px] color-white bg-secondary !border-secondary hover:!bg-secondary group"
						labelClassName="group-hover:!text-white font-medium !tracking-[3px]"
					/>
				</div>
			</BookingWidget.Panel>
		</BookingWidget>
	);
}
