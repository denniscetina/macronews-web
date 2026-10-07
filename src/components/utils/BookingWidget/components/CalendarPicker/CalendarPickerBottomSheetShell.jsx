import PropTypes from "prop-types";
import clsx from "clsx";
import IconCalendar from "./IconCalendar";
import BookingBottomSheet from "../BookingBottomSheet";

export default function CalendarPickerBottomSheetShell({
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
	children
}) {
	return (
		<div
			data-slot="calendar-picker"
			className={clsx("booking-widget-field flex flex-col py-2 w-full", className)}
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
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				className={clsx(
					"w-full min-h-[38px] font-futura border-0 bg-transparent text-left flex items-center transition-all duration-300 cursor-pointer capitalize",
					isSurfaceMode
						? "booking-widget-calendar-range-trigger-surface text-secondary"
						: "booking-widget-calendar-range-trigger-inverse text-white",
				)}
			>
				<IconCalendar
					color={isSurfaceMode ? "surface" : "inverse"}
					className="mr-2"
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

CalendarPickerBottomSheetShell.propTypes = {
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
