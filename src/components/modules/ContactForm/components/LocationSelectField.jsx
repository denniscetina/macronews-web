import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import CreatableSelect from "react-select/creatable";

const resolveSelectedOption = (options, value) =>
	options.find((option) => option.name === value) ||
	(value ? { value, name: value, label: value } : null);

export default function LocationSelectField({
	containerClass,
	fieldName,
	selectInstanceId,
	control,
	requiredRule,
	options,
	onSelectionChange,
	onCreateOption,
	placeholder,
	selectClassName,
	isLoading,
	isDisabled,
	formatOptionLabel,
}) {
	return (
		<div className={containerClass}>
			<Controller
				name={fieldName}
				control={control}
				rules={{ required: requiredRule }}
				render={({ field: { onChange, value, ref } }) => (
					<CreatableSelect
						instanceId={selectInstanceId}
						inputId={`${selectInstanceId}-input`}
						ref={ref}
						isClearable
						options={options}
						value={resolveSelectedOption(options, value)}
						onChange={(selectedOption) => onSelectionChange(selectedOption, onChange)}
						onCreateOption={onCreateOption}
						placeholder={placeholder}
						classNamePrefix="react-select"
						className={selectClassName}
						isLoading={isLoading}
						isDisabled={isDisabled}
						formatOptionLabel={formatOptionLabel}
						menuListProps={{ "data-lenis-prevent": "true" }}
					/>
				)}
			/>
		</div>
	);
}

LocationSelectField.propTypes = {
	containerClass: PropTypes.string.isRequired,
	fieldName: PropTypes.string.isRequired,
	selectInstanceId: PropTypes.string.isRequired,
	control: PropTypes.object.isRequired,
	requiredRule: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	options: PropTypes.arrayOf(PropTypes.object),
	onSelectionChange: PropTypes.func.isRequired,
	onCreateOption: PropTypes.func,
	placeholder: PropTypes.string,
	selectClassName: PropTypes.string.isRequired,
	isLoading: PropTypes.bool,
	isDisabled: PropTypes.bool,
	formatOptionLabel: PropTypes.func,
};

LocationSelectField.defaultProps = {
	requiredRule: false,
	options: [],
	onCreateOption: undefined,
	placeholder: "",
	isLoading: false,
	isDisabled: false,
	formatOptionLabel: undefined,
};
