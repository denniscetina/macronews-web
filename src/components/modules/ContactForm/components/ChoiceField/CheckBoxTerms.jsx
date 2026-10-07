import PropTypes from "prop-types";
import { Controller } from "react-hook-form";

export default function CheckBoxTerms({
	field,
	fieldName,
	containerClass,
	hasError,
	control,
	normalize,
	errorMessage,
}) {
	const termsFieldName =
		fieldName || `terms_${field?.id || normalize(field.label) || "agreement"}`;

	return (
		<div className={`${containerClass} mt-4`}>
			<div className="flex items-start gap-3">
				<Controller
					name={termsFieldName}
					control={control}
					defaultValue={false}
					rules={{
						required: field.isRequired
							? field.errorMessage || `You must accept the ${field.label}`
							: false,
					}}
					render={({ field: controllerField }) => (
						<input
							type="checkbox"
							id={`${normalize(field.label)}_terms`}
							name={controllerField.name}
							checked={Boolean(controllerField.value)}
							onChange={(event) => controllerField.onChange(event.target.checked)}
							onBlur={controllerField.onBlur}
							ref={controllerField.ref}
							className="checkbox-terms max-w-6 max-h-6 mt-1.5 border-2 border-gray-300 rounded cursor-pointer"
						/>
					)}
				/>
				<div className="mt-1">
					<label
						htmlFor={`${normalize(field.label)}_terms`}
						className="text-[#253746] font-futura font-normal leading-6 cursor-pointer"
						dangerouslySetInnerHTML={{
							__html:
								field.choices?.[0]?.text ||
								field.label ||
								"I agree to the terms and conditions",
						}}
					/>
					{hasError && (
						<div className="text-red-500 text-sm mt-1">{errorMessage}</div>
					)}
				</div>
			</div>
		</div>
	);
}

CheckBoxTerms.propTypes = {
	field: PropTypes.object.isRequired,
	fieldName: PropTypes.string.isRequired,
	containerClass: PropTypes.string.isRequired,
	hasError: PropTypes.bool,
	control: PropTypes.object.isRequired,
	normalize: PropTypes.func.isRequired,
	errorMessage: PropTypes.string,
};

CheckBoxTerms.defaultProps = {
	hasError: false,
	errorMessage: "",
};
