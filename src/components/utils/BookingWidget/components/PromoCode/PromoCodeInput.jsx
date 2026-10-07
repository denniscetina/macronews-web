import PropTypes from "prop-types";
import clsx from "clsx";

export default function PromoCodeInput({
	label,
	placeholder,
	value,
	onChange,
	isSurfaceMode = false,
}) {
	return (
		<label data-slot="promo-code" className="booking-widget-field flex flex-col py-2 w-full">
			<span
				className={clsx(
					"booking-widget-label",
					isSurfaceMode && "booking-widget-label-surface",
				)}
			>
				{label}
			</span>
			<input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				className={clsx(
					"booking-widget-input",
					isSurfaceMode && "booking-widget-input-surface",
				)}
			/>
		</label>
	);
}

PromoCodeInput.propTypes = {
	label: PropTypes.string.isRequired,
	placeholder: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	isSurfaceMode: PropTypes.bool,
};
