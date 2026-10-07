import { useMemo } from "react";
import {
	clampValue,
	DEFAULT_MAX_GUESTS,
	DEFAULT_MAX_ROOMS,
	MAX_GUESTS_HOTEL_FLIGHT_MX,
	MAX_ROOMS_HOTEL_FLIGHT_MX,
} from "./constants";

export default function useGuestsRoomsModel({
	bookingType,
	isMxMarket,
	guestsValue,
	roomsValue,
	onGuestsChange,
	onRoomsChange,
	labels
}) {
	const maxGuests =
		bookingType === "hotel + flight" && isMxMarket
			? MAX_GUESTS_HOTEL_FLIGHT_MX
			: DEFAULT_MAX_GUESTS;
	const maxRooms =
		bookingType === "hotel + flight" && isMxMarket
			? MAX_ROOMS_HOTEL_FLIGHT_MX
			: DEFAULT_MAX_ROOMS;
	const isRoomsDisabled = bookingType === "hotel + flight" && !isMxMarket;

	const guests = clampValue(Number(guestsValue) || 1, 1, maxGuests);
	const rooms = clampValue(Number(roomsValue) || 1, 1, Math.min(maxRooms, guests));

	const adultsLabel = guests === 1 ? labels?.lbl_adult || "Adult" : labels?.lbl_adults || "Adults";
	const roomsLabel = rooms === 1 ? labels?.lbl_room || "Room" : labels?.lbl_rooms || "Rooms";
	const summaryLabel = useMemo(
		() => `${guests} ${adultsLabel}, ${rooms} ${roomsLabel}`,
		[guests, adultsLabel, rooms, roomsLabel],
	);

	const decrementGuests = () => {
		const nextGuests = clampValue(guests - 1, 1, maxGuests);
		onGuestsChange?.(nextGuests);

		if (rooms > nextGuests) {
			onRoomsChange?.(nextGuests);
		}
	};

	const incrementGuests = () => {
		const nextGuests = clampValue(guests + 1, 1, maxGuests);
		onGuestsChange?.(nextGuests);
	};

	const decrementRooms = () => {
		if (isRoomsDisabled) {
			return;
		}

		const nextRooms = clampValue(rooms - 1, 1, Math.min(maxRooms, guests));
		onRoomsChange?.(nextRooms);
	};

	const incrementRooms = () => {
		if (isRoomsDisabled) {
			return;
		}

		const nextRooms = clampValue(rooms + 1, 1, Math.min(maxRooms, guests));
		onRoomsChange?.(nextRooms);
	};

	return {
		maxGuests,
		maxRooms,
		isRoomsDisabled,
		guests,
		rooms,
		adultsLabel,
		roomsLabel,
		summaryLabel,
		canIncrementGuests: guests < maxGuests,
		canDecrementGuests: guests > 1,
		canIncrementRooms: rooms < Math.min(maxRooms, guests),
		canDecrementRooms: rooms > 1,
		decrementGuests,
		incrementGuests,
		decrementRooms,
		incrementRooms,
	};
}
