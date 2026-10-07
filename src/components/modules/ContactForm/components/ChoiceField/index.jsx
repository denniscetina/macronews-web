import PropTypes from "prop-types";
import CheckBox from "./CheckBox";
import CheckBoxTerms from "./CheckBoxTerms";
import Radio from "./Radio";

export default function ChoiceField({
	field,
	fieldName,
	containerClass,
	hasError,
	control,
	normalize,
	mode,
	errorMessage,
}) {
	if (mode === "radio") {
		return (
			<Radio
				field={field}
				fieldName={fieldName}
				containerClass={containerClass}
				hasError={hasError}
				control={control}
				normalize={normalize}
			/>
		);
	}

	if (mode === "checkbox_terms") {
		return (
			<CheckBoxTerms
				field={field}
				fieldName={fieldName}
				containerClass={containerClass}
				hasError={hasError}
				control={control}
				normalize={normalize}
				errorMessage={errorMessage}
			/>
		);
	}

	if (mode === "checkbox") {
		return (
			<CheckBox
				field={field}
				fieldName={fieldName}
				containerClass={containerClass}
				hasError={hasError}
				control={control}
				normalize={normalize}
			/>
		);
	}

	return null;
}

ChoiceField.propTypes = {
	field: PropTypes.object.isRequired,
	fieldName: PropTypes.string.isRequired,
	containerClass: PropTypes.string.isRequired,
	hasError: PropTypes.bool,
	control: PropTypes.object.isRequired,
	normalize: PropTypes.func.isRequired,
	mode: PropTypes.oneOf(["radio", "checkbox", "checkbox_terms"]).isRequired,
	errorMessage: PropTypes.string,
};

ChoiceField.defaultProps = {
	hasError: false,
	errorMessage: "",
};
