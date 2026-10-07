import PropTypes from "prop-types";
import { Controller } from "react-hook-form";

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
		const isSingleSelection = field?.cssClass?.includes("single_option");
		const isRichText = field?.cssClass?.includes("ritch-text");

		return (
			<div className={`${containerClass} mt-4`}>
				{!isRichText && (
					<div
						className={`font-futura font-normal text-[#253746] leading-6.5 ${
							hasError ? "text-red-500" : ""
						}`}
					>
						{field.label}
					</div>
				)}
				<div className={`flex flex-col ${isRichText ? "gap-2" : "gap-3"} mt-2`}>
					<Controller
						name={fieldName}
						control={control}
						rules={{
							required: field.isRequired
								? field.errorMessage || `The field ${field.label} is required`
								: false,
							validate: !isSingleSelection
								? (value) => {
										if (field.isRequired && (!value || value.length === 0)) {
											return (
												field.errorMessage ||
												`At least one option is required for ${field.label}`
											);
										}
										return true;
									}
								: undefined,
						}}
						render={({ field: { onChange, value, ref } }) => (
							<>
								{field.choices?.map((choice, index) => {
									const id = `${normalize(field.label)}_${index}`;
									const inputType = isSingleSelection ? "radio" : "checkbox";
									const isChecked = isSingleSelection
										? value === choice.value
										: value?.includes(choice.value);

									return (
										<div
											key={id}
											className={`radio-option flex ${isRichText ? "items-start" : "items-center $h-[40px]"}`}
										>
											<input
												type={inputType}
												id={id}
												value={choice.value}
												checked={Boolean(isChecked)}
												onChange={(event) => {
													if (isSingleSelection) {
														onChange(choice.value);
														return;
													}
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
												className="hidden"
											/>
											<label
												htmlFor={id}
												className={`radio-label ${
													isRichText
														? "w-full flex items-start cursor-pointer p-4 border border-[#6a7282] rounded transition-colors hover:bg-gray-50"
														: "text-[#253746] font-futura font-normal leading-6 border-[#6a7282] transition-colors hover:bg-gray-50"
												}`}
											>
												{isRichText ? (
													<div className="flex flex-col items-start gap-2 w-full">
														{choice.value && (
															<div className="font-futura font-[450] text-[16px] tracking-[2.4px] text-[#253746] leading-5 uppercase">
																{choice.value}
															</div>
														)}
														{choice.text && (
															<div className="text-[#253746] font-futura font-normal leading-6 text-left">
																{choice.text}
															</div>
														)}
													</div>
												) : (
													choice.text
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

	if (mode === "checkbox_terms") {
		const termsFieldName = fieldName || `terms_${field?.id || normalize(field.label) || "agreement"}`;

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

	if (mode === "checkbox") {
		const isSingleSelection = field?.cssClass?.includes("single_option");

		return (
			<div className={`${containerClass} mt-4`}>
				{isSingleSelection ? (
					<>
						<div
							className={`font-futura font-normal text-[#253746] leading-6.5 ${
								hasError ? "text-red-500" : ""
							}`}
						>
							{field.label}
						</div>
						<div className="flex flex-col gap-3 mt-2">
							<Controller
								name={fieldName}
								control={control}
								rules={{
									required: field.isRequired
										? field.errorMessage || `The field ${field.label} is required`
										: false,
								}}
								render={({ field: { onChange, value, ref } }) => (
									<>
										{field.choices?.map((choice, index) => {
											const id = `${normalize(field.label)}_${index}`;
											return (
												<div key={id} className="radio-option flex items-center $h-[40px]">
													<input
														type="radio"
														id={id}
														value={choice.value}
														checked={value === choice.value}
														onChange={() => onChange(choice.value)}
														ref={ref}
														className="hidden"
													/>
													<label htmlFor={id} className="radio-label">
														{choice.text}
													</label>
												</div>
											);
										})}
									</>
								)}
							/>
						</div>
					</>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-2 multicheck">
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
										const id = `${normalize(field.label)}_${index}`;
										return (
											<div key={id} className="radio-option flex items-center">
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
													className="hidden"
												/>
												<label htmlFor={id} className="radio-label">
													{choice.text}
												</label>
											</div>
										);
									})}
								</>
							)}
						/>
					</div>
				)}
			</div>
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
