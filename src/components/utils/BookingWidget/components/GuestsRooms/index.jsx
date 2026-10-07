"use client";

import { useEffect, useState } from "react";
import { useBookingWidget } from "../../store/BookingWidgetContext";
import { BOOKING_WIDGET_RENDER_MODE } from "../../utils/renderMode";
import { useDictionaryScope } from "@/lib/i18n/ScopedDictionaryProvider";
import useGuestsRoomsModel from "./useGuestsRoomsModel";
import useGuestsRoomsPopover from "./useGuestsRoomsPopover";
import GuestsRoomsEditor from "./GuestsRoomsEditor";
import GuestsRoomsPopoverShell from "./GuestsRoomsPopoverShell";
import GuestsRoomsBottomSheetShell from "./GuestsRoomsBottomSheetShell";

const GUESTS_ROOMS_INTERACTION_MODE = {
	POPOVER: "popover",
	BOTTOM_SHEET: "bottom-sheet",
};

export default function BookingWidgetGuestsRooms({
	className,
	isMx,
	interactionMode = GUESTS_ROOMS_INTERACTION_MODE.POPOVER,
}) {
	const { t = {} } = useDictionaryScope("utils.BookingWidget.components.GuestsRooms");
	const { booking, updateBooking, isMxMarket, renderMode } = useBookingWidget();
	const isSurfaceMode = renderMode === BOOKING_WIDGET_RENDER_MODE.SURFACE;
	const resolvedIsMx = typeof isMx === "boolean" ? isMx : isMxMarket;
	const isBottomSheetMode =
		interactionMode === GUESTS_ROOMS_INTERACTION_MODE.BOTTOM_SHEET;

	const {
		isOpen,
		popoverDirection,
		popoverMaxHeight,
		containerRef,
		triggerRef,
		popoverRef,
		togglePopover,
	} = useGuestsRoomsPopover();
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [draftGuests, setDraftGuests] = useState(Number(booking.guests) || 1);
	const [draftRooms, setDraftRooms] = useState(Number(booking.rooms) || 1);

	const model = useGuestsRoomsModel({
		bookingType: booking.type,
		isMxMarket: resolvedIsMx,
		guestsValue: booking.guests,
		roomsValue: booking.rooms,
		onGuestsChange: (nextGuests) => updateBooking("guests", nextGuests),
		onRoomsChange: (nextRooms) => updateBooking("rooms", nextRooms),
		labels: t,
	});
	const draftModel = useGuestsRoomsModel({
		bookingType: booking.type,
		isMxMarket: resolvedIsMx,
		guestsValue: draftGuests,
		roomsValue: draftRooms,
		onGuestsChange: (nextGuests) => setDraftGuests(nextGuests),
		onRoomsChange: (nextRooms) => setDraftRooms(nextRooms),
	});

	useEffect(() => {
		if (Number(booking.guests) !== model.guests) {
			updateBooking("guests", model.guests);
		}

		if (Number(booking.rooms) !== model.rooms) {
			updateBooking("rooms", model.rooms);
		}
	}, [booking.guests, booking.rooms, model.guests, model.rooms, updateBooking]);

	const openSheet = () => {
		setDraftGuests(model.guests);
		setDraftRooms(model.rooms);
		setIsSheetOpen(true);
	};

	const closeSheet = () => {
		setIsSheetOpen(false);
	};

	const applySheet = () => {
		updateBooking("guests", draftModel.guests);
		updateBooking("rooms", draftModel.rooms);
		setIsSheetOpen(false);
	};

	if (isBottomSheetMode) {
		return (
			<GuestsRoomsBottomSheetShell
				className={className}
				label={t.lbl_guests_rooms || "Guests & Rooms"}
				summaryLabel={model.summaryLabel}
				isSurfaceMode={isSurfaceMode}
				isOpen={isSheetOpen}
				onOpen={openSheet}
				onClose={closeSheet}
				onApply={applySheet}
				applyLabel={t.btn_accept || "Accept"}
				maxHeight="75vh"
			>
				<GuestsRoomsEditor
					adultsLabel={t.lbl_adults || "Adults"}
					roomsLabel={t.lbl_rooms || "Rooms"}
					guests={draftModel.guests}
					rooms={draftModel.rooms}
					canIncrementGuests={draftModel.canIncrementGuests}
					canDecrementGuests={draftModel.canDecrementGuests}
					canIncrementRooms={draftModel.canIncrementRooms}
					canDecrementRooms={draftModel.canDecrementRooms}
					isRoomsDisabled={draftModel.isRoomsDisabled}
					onIncrementGuests={draftModel.incrementGuests}
					onDecrementGuests={draftModel.decrementGuests}
					onIncrementRooms={draftModel.incrementRooms}
					onDecrementRooms={draftModel.decrementRooms}
				/>
			</GuestsRoomsBottomSheetShell>
		);
	}

	return (
		<GuestsRoomsPopoverShell
			className={className}
			label={t.lbl_guests_rooms || "Guests & Rooms"}
			summaryLabel={model.summaryLabel}
			isOpen={isOpen}
			isSurfaceMode={isSurfaceMode}
			popoverDirection={popoverDirection}
			popoverMaxHeight={popoverMaxHeight}
			containerRef={containerRef}
			triggerRef={triggerRef}
			popoverRef={popoverRef}
			onToggle={togglePopover}
		>
			<GuestsRoomsEditor
				adultsLabel={t.lbl_adults || "Adults"}
				roomsLabel={t.lbl_rooms || "Rooms"}
				guests={model.guests}
				rooms={model.rooms}
				canIncrementGuests={model.canIncrementGuests}
				canDecrementGuests={model.canDecrementGuests}
				canIncrementRooms={model.canIncrementRooms}
				canDecrementRooms={model.canDecrementRooms}
				isRoomsDisabled={model.isRoomsDisabled}
				onIncrementGuests={model.incrementGuests}
				onDecrementGuests={model.decrementGuests}
				onIncrementRooms={model.incrementRooms}
				onDecrementRooms={model.decrementRooms}
			/>
		</GuestsRoomsPopoverShell>
	);
}
