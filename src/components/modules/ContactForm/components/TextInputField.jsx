import PropTypes from "prop-types";

export default function TextInputField({
	containerClass,
	baseInputClass,
	hasError,
	errorClass,
	field,
	type,
	register,
	fieldName,
	commonRegisterRules,
}) {
	return (
		<div className={containerClass}>
			<input
				className={`${baseInputClass} ${hasError ? errorClass : ""} no-spinner`}
				placeholder={field.placeholder || field.label}
				type={type}
				defaultValue={field.defaultValue}
				{...register(fieldName, commonRegisterRules)}
			/>
		</div>
	);
}

TextInputField.propTypes = {
	containerClass: PropTypes.string.isRequired,
	baseInputClass: PropTypes.string.isRequired,
	hasError: PropTypes.bool,
	errorClass: PropTypes.string.isRequired,
	field: PropTypes.object.isRequired,
	type: PropTypes.string.isRequired,
	register: PropTypes.func.isRequired,
	fieldName: PropTypes.string.isRequired,
	commonRegisterRules: PropTypes.object,
};

TextInputField.defaultProps = {
	hasError: false,
	commonRegisterRules: {},
};
