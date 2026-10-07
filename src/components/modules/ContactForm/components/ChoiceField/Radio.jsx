import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import clsx from "clsx";
export default function Radio({
	field,
	fieldName,
	containerClass,
	hasError,
	control,
	normalize,
}) {
	const isRichText = field?.cssClass?.includes("ritch-text");
	const { labelPlacement = "", displayAsButtonGroup = false } = field
	return (
		<div className={`${containerClass}`}>
			{ (labelPlacement !== "hidden_label") && (
				<div
					className={clsx(
						"font-futura font-normal text-secondary leading-6.5 mb-2",
						hasError ? "text-red-500" : ""
					)}
				>
					{field.label}
				</div>
			)}
			<div className={clsx(
				"flex flex-col",
				displayAsButtonGroup ?  "gap-2" : "gap-4"
			)}>
				<Controller
					name={fieldName}
					control={control}
					rules={{
						required: field.isRequired
							? field.errorMessage || `The field ${field.label} is required`
							: false
					}}
					render={({ field: { onChange, value, ref } }) => (
						<>
							{field.choices?.map((choice, index) => {
								const id = `${normalize(field.id)}_${index}`;
								return (
									<div
										key={id}
										className={clsx(
											"radio-option flex",
											displayAsButtonGroup ? "" : "items-center justify-center gap-2"
										)}
									>
										<input
											type="radio"
											id={id}
											value={choice.value}
											checked={Boolean(value === choice.value)}
											onChange={(event) => {
												onChange(choice.value);
											}}
											ref={ref}
											className={clsx(
												"accent-primary focus:ring-primary border-primary text-primary",
												displayAsButtonGroup ? "hidden" : "cursor-pointer"
											)}
										/>
										<label
											htmlFor={id}
											className={clsx("radio-label w-full flex items-start cursor-pointer transition-colors"
											)}
										>
											{displayAsButtonGroup ? (
												<div className="cf-button-group flex flex-col items-start gap-1 w-full transition-colors">
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

Radio.propTypes = {
	field: PropTypes.object.isRequired,
	fieldName: PropTypes.string.isRequired,
	containerClass: PropTypes.string.isRequired,
	hasError: PropTypes.bool,
	control: PropTypes.object.isRequired,
	normalize: PropTypes.func.isRequired,
};

Radio.defaultProps = {
	hasError: false,
};
