import PropTypes from "prop-types";
import clsx from "clsx";
import BookingBottomSheet from "../BookingBottomSheet";

export default function PromoCodeBottomSheetShell({
	className,
	triggerLabel,
	fieldLabel,
	summaryLabel,
	isOpen,
	onOpen,
	onClose,
	onApply,
	applyLabel = "Accept",
	maxHeight = "75vh",
	children,
}) {
	return (
		<div data-slot="promo-code" className={clsx("booking-widget-field flex flex-col py-2 w-full", className)}>
			<button
				type="button"
				onClick={onOpen}
				aria-haspopup="dialog"
				aria-expanded={isOpen}
				className="w-full text-center font-futura text-secondary tracking-[2px] text-[14px] cursor-pointer"
			>
				{summaryLabel || triggerLabel}
			</button>

			<BookingBottomSheet
				isOpen={isOpen}
				title={fieldLabel}
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

PromoCodeBottomSheetShell.propTypes = {
	className: PropTypes.string,
	triggerLabel: PropTypes.string.isRequired,
	fieldLabel: PropTypes.string.isRequired,
	summaryLabel: PropTypes.string,
	isOpen: PropTypes.bool.isRequired,
	onOpen: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
	onApply: PropTypes.func.isRequired,
	applyLabel: PropTypes.string,
	maxHeight: PropTypes.string,
	children: PropTypes.node.isRequired,
};
