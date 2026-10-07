import PropTypes from "prop-types";
import CounterRow from "./CounterRow";

export default function GuestsRoomsEditor({
	adultsLabel = "Adults",
	roomsLabel = "Rooms",
	guests,
	rooms,
	canIncrementGuests,
	canDecrementGuests,
	canIncrementRooms,
	canDecrementRooms,
	isRoomsDisabled = false,
	onIncrementGuests,
	onDecrementGuests,
	onIncrementRooms,
	onDecrementRooms,
}) {
	return (
		<>
			<CounterRow
				label={adultsLabel}
				value={guests}
				onIncrement={onIncrementGuests}
				onDecrement={onDecrementGuests}
				canIncrement={canIncrementGuests}
				canDecrement={canDecrementGuests}
			/>
			<CounterRow
				label={roomsLabel}
				value={rooms}
				onIncrement={onIncrementRooms}
				onDecrement={onDecrementRooms}
				canIncrement={canIncrementRooms}
				canDecrement={canDecrementRooms}
				disabled={isRoomsDisabled}
			/>
		</>
	);
}

GuestsRoomsEditor.propTypes = {
	adultsLabel: PropTypes.string,
	roomsLabel: PropTypes.string,
	guests: PropTypes.number.isRequired,
	rooms: PropTypes.number.isRequired,
	canIncrementGuests: PropTypes.bool.isRequired,
	canDecrementGuests: PropTypes.bool.isRequired,
	canIncrementRooms: PropTypes.bool.isRequired,
	canDecrementRooms: PropTypes.bool.isRequired,
	isRoomsDisabled: PropTypes.bool,
	onIncrementGuests: PropTypes.func.isRequired,
	onDecrementGuests: PropTypes.func.isRequired,
	onIncrementRooms: PropTypes.func.isRequired,
	onDecrementRooms: PropTypes.func.isRequired,
};
