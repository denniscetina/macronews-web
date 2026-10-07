import PropTypes from "prop-types";
import clsx from "clsx";
import IconBed from "./IconBed";
import BookingBottomSheet from "../BookingBottomSheet";

export default function GuestsRoomsBottomSheetShell({
	className,
	label,
	summaryLabel,
	isSurfaceMode = false,
	isOpen,
	onOpen,
	onClose,
	onApply,
	applyLabel = "Accept",
	maxHeight = "75vh",
	children,
}) {
	return (
		<div
			data-slot="guests-rooms"
			className={clsx("booking-widget-field booking-widget-guests-rooms", className)}
		>
			<span
				className={clsx(
					"booking-widget-label",
					isSurfaceMode && "booking-widget-label-surface",
				)}
			>
				{label}
			</span>

			<button
				type="button"
				onClick={onOpen}
				aria-expanded={isOpen}
				aria-haspopup="dialog"
				className={clsx(
					"booking-widget-combined-trigger flex items-center",
					isSurfaceMode
						? "booking-widget-combined-trigger-surface"
						: "booking-widget-combined-trigger-inverse",
				)}
			>
				<IconBed
					color={isSurfaceMode ? "surface" : "inverse"}
					className="mr-2 inline-block align-middle"
				/>
				{summaryLabel}
			</button>

			<BookingBottomSheet
				isOpen={isOpen}
				title={label}
				onClose={onClose}
				onApply={onApply}
				applyLabel={applyLabel}
				maxHeight={maxHeight}
			>
				{children}
			</BookingBottomSheet>
		</div>
	);
}

GuestsRoomsBottomSheetShell.propTypes = {
	className: PropTypes.string,
	label: PropTypes.string.isRequired,
	summaryLabel: PropTypes.string.isRequired,
	isSurfaceMode: PropTypes.bool,
	isOpen: PropTypes.bool.isRequired,
	onOpen: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	onApply: PropTypes.func.isRequired,
	applyLabel: PropTypes.string,
	maxHeight: PropTypes.string,
	children: PropTypes.node.isRequired,
};
