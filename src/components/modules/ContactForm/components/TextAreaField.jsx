import PropTypes from "prop-types";

export default function TextAreaField({
	containerClass,
	field,
	hasError,
	errorClass,
	register,
	fieldName,
	commonRegisterRules,
}) {
	return (
		<div className={containerClass}>
			<div
				className={`font-futura font-normal text-[#253746] leading-6.5 ${
					hasError ? "text-red-500" : ""
				}`}
			>
				{field.label}
			</div>
			<textarea
				className={`text-[#253746] font-futura font-normal leading-6 w-full mb-sm ${
					hasError ? errorClass : ""
				}`}
				placeholder={field.placeholder || field.label}
				defaultValue={field.defaultValue}
				rows={4}
				{...register(fieldName, commonRegisterRules)}
			/>
		</div>
	);
}

TextAreaField.propTypes = {
	containerClass: PropTypes.string.isRequired,
	field: PropTypes.object.isRequired,
	hasError: PropTypes.bool,
	errorClass: PropTypes.string.isRequired,
	register: PropTypes.func.isRequired,
	fieldName: PropTypes.string.isRequired,
	commonRegisterRules: PropTypes.object,
};

TextAreaField.defaultProps = {
	hasError: false,
	commonRegisterRules: {},
};
