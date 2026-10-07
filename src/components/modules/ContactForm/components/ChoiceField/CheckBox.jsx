import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import clsx from "clsx";

export default function CheckBox({
	field,
	fieldName,
	containerClass,
	hasError,
	control,
	normalize,
}) {
	const { labelPlacement = "", displayAsButtonGroup = false } = field
	return (
		<div className={`${containerClass}`}>
			<div className={clsx(
				"grid grid-cols-1 lg:grid-cols-3 multicheck",
				displayAsButtonGroup ?  "gap-2" : "gap-4"
			)}>
					<Controller
						name={fieldName}
						control={control}
						rules={{
							required: field.isRequired
								? field.errorMessage || `The field ${field.label} is required`
								: false,
							validate: (value) => {
								if (field.isRequired && (!value || value.length === 0)) {
									return (
										field.errorMessage ||
										`At least one option is required for ${field.label}`
									);
								}
								return true;
							},
						}}
						render={({ field: { onChange, value, ref } }) => (
							<>
								{field.choices?.map((choice, index) => {
									const id = `${normalize(field.id)}_${index}`;
									return (
										<div
											key={id}
											className="checkbox-option flex items-center gap-2">
											<input
												type="checkbox"
												id={id}
												value={choice.value}
												checked={value?.includes(choice.value)}
												onChange={(event) => {
													const currentValue = Array.isArray(value) ? value : [];
													if (event.target.checked) {
														onChange([...currentValue, choice.value]);
													} else {
														onChange(
															currentValue.filter((item) => item !== choice.value),
														);
													}
												}}
												ref={ref}
												className={clsx(
													"accent-primary focus:ring-primary border-primary text-primary",
													displayAsButtonGroup ? "hidden" : "cursor-pointer"
												)}
											/>
											<label
												htmlFor={id}
												className="w-full checkbox-label">
												{displayAsButtonGroup ? (
													<div className="cf-button-group">
														{choice.buttonTitle && (
															<span className="font-medium tracking-widest leading-6 uppercase">
															{choice.buttonTitle}
														</span>
														)}
														{choice.text && (
															<span className="leading-6">
															{choice.text}
														</span>
														)}
													</div>
												) : (
													<span className="text-lg">{choice.text}</span>
												)}
											</label>
										</div>
									);
								})}
							</>
						)}
					/>
				</div>
		</div>
	);
}

CheckBox.propTypes = {
	field: PropTypes.object.isRequired,
	fieldName: PropTypes.string.isRequired,
	containerClass: PropTypes.string.isRequired,
	hasError: PropTypes.bool,
	control: PropTypes.object.isRequired,
	normalize: PropTypes.func.isRequired,
};

CheckBox.defaultProps = {
	hasError: false,
};
