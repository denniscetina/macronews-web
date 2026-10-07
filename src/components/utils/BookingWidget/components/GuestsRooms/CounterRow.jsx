import clsx from "clsx";
import PropTypes from "prop-types";

export default function CounterRow({
	label,
	value,
	onIncrement,
	onDecrement,
	canIncrement,
	canDecrement,
	disabled = false,
}) {
	return (
		<div className={clsx(
			"booking-widget-counter-row",
			"flex items-center justify-between gap-4 py-2",
			disabled && "opacity-60"
		)}>
			<span className="booking-widget-counter-label font-futura text-[14px] uppercase tracking-[1.2px] text-secondary">{label}</span>
			<div className="booking-widget-counter-controls flex items-center gap-3">
				<button
					type="button"
					onClick={onDecrement}
					disabled={disabled || !canDecrement}
					className={clsx(
						"booking-widget-counter-button",
						"w-9 h-9 rounded-full border border-secondary text-secondary hover:bg-secondary hover:text-white",
						"text-xl leading-none flex items-center justify-center",
						"transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
						disabled && "opacity-60"
					)}
					aria-label={`Decrease ${label}`}
				>
					-
				</button>
				<span className="booking-widget-counter-value min-w-[24px] text-center font-futura text-[16px] text-secondary;">{value}</span>
				<button
					type="button"
					onClick={onIncrement}
					disabled={disabled || !canIncrement}
					className={clsx(
						"booking-widget-counter-button",
						"w-9 h-9 rounded-full border border-secondary text-secondary hover:bg-secondary hover:text-white",
						"text-xl leading-none flex items-center justify-center",
						"transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
						disabled && "opacity-60"
					)}
					aria-label={`Increase ${label}`}
				>
					+
				</button>
			</div>
		</div>
	);
}

CounterRow.propTypes = {
	label: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired,
	onIncrement: PropTypes.func.isRequired,
	onDecrement: PropTypes.func.isRequired,
	canIncrement: PropTypes.bool.isRequired,
	canDecrement: PropTypes.bool.isRequired,
	disabled: PropTypes.bool,
};
