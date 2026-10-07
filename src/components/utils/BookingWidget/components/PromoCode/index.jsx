"use client";

import { useState } from "react";
import clsx from "clsx";
import { useBookingWidget } from "../../store/BookingWidgetContext";
import { BOOKING_WIDGET_RENDER_MODE } from "../../utils/renderMode";
import { useDictionaryScope } from "@/lib/i18n/ScopedDictionaryProvider";
import PromoCodeInput from "./PromoCodeInput";
import PromoCodeBottomSheetShell from "./PromoCodeBottomSheetShell";
import { PROMO_CODE_INTERACTION_MODE } from "./constants";

export default function BookingWidgetPromoCode({
	className,
	placeholder,
	isVisible = false,
	interactionMode = PROMO_CODE_INTERACTION_MODE.INLINE,
	buttonLabel,
}) {
	const { t = {} } = useDictionaryScope("utils.BookingWidget.components.PromoCode");
	const { booking, updateBooking, renderMode } = useBookingWidget();
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [draftPromoCode, setDraftPromoCode] = useState("");
	const resolvedPlaceholder = placeholder || t.lbl_enter_code || "Enter Code";
	const promoCodeLabel = t.lbl_promo_code || "Promo Code";
	const isSurfaceMode = renderMode === BOOKING_WIDGET_RENDER_MODE.SURFACE;
	const isBottomSheetMode =
		interactionMode === PROMO_CODE_INTERACTION_MODE.BOTTOM_SHEET;
	const resolvedButtonLabel = buttonLabel || t.lbl_have_promo_code || "Have a promo code?";

	if (!isVisible || booking.type !== "hotel") {
		return null;
	}

	if (isBottomSheetMode) {
		const openSheet = () => {
			setDraftPromoCode(booking.promoCode || "");
			setIsSheetOpen(true);
		};

		const closeSheet = () => {
			setIsSheetOpen(false);
		};

		const applySheet = () => {
			updateBooking("promoCode", draftPromoCode);
			setIsSheetOpen(false);
		};

		return (
			<PromoCodeBottomSheetShell
				className={className}
				triggerLabel={resolvedButtonLabel}
				fieldLabel={promoCodeLabel}
				summaryLabel={booking.promoCode}
				isOpen={isSheetOpen}
				onOpen={openSheet}
				onClose={closeSheet}
				onApply={applySheet}
				applyLabel={t.btn_accept || "Accept"}
				maxHeight="75vh"
			>
				<PromoCodeInput
					label={promoCodeLabel}
					placeholder={resolvedPlaceholder}
					value={draftPromoCode}
					onChange={(event) => setDraftPromoCode(event.target.value)}
					isSurfaceMode
				/>
			</PromoCodeBottomSheetShell>
		);
	}

	return (
		<label data-slot="promo-code" className={clsx("booking-widget-field flex flex-col py-2 w-full", className)}>
			<span
				className={clsx(
					"booking-widget-label",
					isSurfaceMode && "booking-widget-label-surface",
				)}
			>
				{promoCodeLabel}
			</span>
			<input
				type="text"
				placeholder={resolvedPlaceholder}
				value={booking.promoCode}
				onChange={(event) => updateBooking("promoCode", event.target.value)}
				className={clsx(
					"booking-widget-input",
					isSurfaceMode && "booking-widget-input-surface",
				)}
			/>
		</label>
	);
}
