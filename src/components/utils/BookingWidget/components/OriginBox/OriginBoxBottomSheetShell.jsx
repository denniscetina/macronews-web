import PropTypes from "prop-types";
import clsx from "clsx";
import IconPin from "./IconPin";
import BookingBottomSheet from "../BookingBottomSheet";

export default function OriginBoxBottomSheetShell({
	className,
	label,
	summaryLabel,
	isSurfaceMode = false,
	isOpen,
	onOpen,
	onClose,
	onApply,
	isApplyDisabled = false,
	applyLabel = "Accept",
	height = "auto",
	maxHeight = "75vh",
	children,
}) {
	return (
		<div data-slot="origin-box" className={clsx("booking-widget-field flex flex-col py-2 w-full", className)}>
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
					"booking-widget-combined-trigger flex items-center",
					isSurfaceMode
						? "booking-widget-combined-trigger-surface"
						: "booking-widget-combined-trigger-inverse",
				)}
			>
				<IconPin
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
				isApplyDisabled={isApplyDisabled}
				applyLabel={applyLabel}
				height={height}
				maxHeight={maxHeight}
			>
				{children}
			</BookingBottomSheet>
		</div>
	);
}

OriginBoxBottomSheetShell.propTypes = {
	className: PropTypes.string,
	label: PropTypes.string.isRequired,
	summaryLabel: PropTypes.string.isRequired,
	isSurfaceMode: PropTypes.bool,
	isOpen: PropTypes.bool.isRequired,
	onOpen: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	onApply: PropTypes.func.isRequired,
	isApplyDisabled: PropTypes.bool,
	applyLabel: PropTypes.string,
	maxHeight: PropTypes.string,
	children: PropTypes.node.isRequired,
};
