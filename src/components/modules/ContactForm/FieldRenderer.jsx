"use client";

import clsx from "clsx";
import has from "lodash/has";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import { Controller } from "react-hook-form";
import ChoiceField from "./components/ChoiceField";
import FileUploadField from "./components/FileUploadField";
import {
	getFieldName,
	getRequiredRule,
	getSelectWidthClass,
	getWidthClass,
} from "./utils/fieldHelpers";
import TextAreaField from "./components/TextAreaField";
import TextInputField from "./components/TextInputField";
import { createTranslator } from "@/lib/i18n/translator";

const SELECT_CLASS_NAME = "select-contact-form";
const ContactSelect = dynamic(() => import("./components/ContactSelect.client"), {
	ssr: false,
	loading: () => null,
});
const DateField = dynamic(() => import("./components/DateField"), {
	ssr: false,
	loading: () => null,
});
const LocationSelectField = dynamic(
	() => import("./components/LocationSelectField"),
	{
		ssr: false,
		loading: () => null,
	},
);

export default function FieldRenderer({
	field,
	control,
	errors,
	errorClass,
	register,
	normalize,
	baseInputClass,
	setValue,
	TYPE_TO_INPUT,
	countries,
	states,
	cities,
	loadingCountries,
	loadingStates,
	loadingCities,
	selectedCountry,
	selectedState,
	setCountryId,
	setStateId,
	handleCreateCity,
	handleCreateCountry,
	handleCreateState,
	arrivalDate,
	setArrivalDate,
	departureDate,
	setDepartureDate,
	arrivalRef,
	departureRef,
	today,
	fileNames,
	setFileNames,
	dict,
}) {
	const t = createTranslator(dict);

	if (field.type === "section") {
		return (
			<div className="w-full flex justify-center md:justify-start items-center gap-4 self-stretch pt-4">
				<h4 className="text-[#253746] text-center font-futura font-normal tracking-[2.4px] text-[20px] leading-5 uppercase">
					{field.label}
				</h4>
			</div>
		);
	}
	const fieldName = getFieldName(field);
	const widthClass = getWidthClass(field?.size ?? "large");
	const containerClass = `input-container ${widthClass}`;
	const type = TYPE_TO_INPUT[field.type] ?? "text";
	const hasError = has(errors, fieldName);
	const commonRegisterRules = {
		required: getRequiredRule(field, `The field ${field.label} is required`),
	};

	if (field.dataSource === "country") {
		const countryContainerClass = `input-container ${widthClass} mb-4`;
		const selectInstanceId = `contact-form-select-${field.id}`;
		const requiredRule = getRequiredRule(field, `The field ${field.label} is required`);
		const handleSelectionChange = (selectedOption, onChange) => {
			const newValue = selectedOption?.name || "";
			onChange(newValue);

			if (selectedOption?.isNew) {
				setCountryId(selectedOption.value);
			} else {
				setCountryId(selectedOption?.value || null);
			}

			setValue("State/ Province", "", { shouldValidate: true });
			setValue("City", "", { shouldValidate: true });
			setStateId(null);
		};

		return (
			<LocationSelectField
				containerClass={countryContainerClass}
				fieldName={fieldName}
				selectInstanceId={selectInstanceId}
				control={control}
				requiredRule={requiredRule}
				options={countries}
				onSelectionChange={handleSelectionChange}
				onCreateOption={handleCreateCountry}
				placeholder={field.placeholder || "Select or create country"}
				selectClassName={clsx(SELECT_CLASS_NAME, hasError && "border-red-500")}
				isLoading={loadingCountries}
				isDisabled={loadingCountries}
				formatOptionLabel={(option) => (
					<div className="flex items-center">
						<p title={option.label}>{option.label}</p>
						{option.isNew && (
							<span className="ml-2 text-xs text-gray-500">
								{t("FieldRenderer.lbl_new", "(new)")}
							</span>
						)}
					</div>
				)}
			/>
		);
	}

	if (field.dataSource === "state") {
		const stateContainerClass = `input-container ${widthClass} mb-4`;
		const selectInstanceId = `contact-form-select-${field.id}`;
		const isDisabled = !selectedCountry;
		const requiredRule = selectedCountry
			? getRequiredRule(field, `The field ${field.label} is required`)
			: false;
		const handleSelectionChange = (selectedOption, onChange) => {
			const newValue = selectedOption?.name || "";
			onChange(newValue);

			if (selectedOption?.isNew) {
				setStateId(selectedOption.value);
			} else {
				setStateId(selectedOption?.value || null);
			}

			setValue("City", "", { shouldValidate: true });
		};

		return (
			<LocationSelectField
				containerClass={stateContainerClass}
				fieldName={fieldName}
				selectInstanceId={selectInstanceId}
				control={control}
				requiredRule={requiredRule}
				options={states}
				onSelectionChange={handleSelectionChange}
				onCreateOption={handleCreateState}
				placeholder={
					isDisabled ? "Select country first" : field.placeholder || "Select or create state"
				}
				selectClassName={clsx(
					SELECT_CLASS_NAME,
					hasError && "border-red-500",
					isDisabled && "opacity-50 cursor-not-allowed",
				)}
				isLoading={loadingStates}
				isDisabled={isDisabled || loadingStates}
			/>
		);
	}

	if (field.dataSource === "city") {
		const selectInstanceId = `contact-form-select-${field.id}`;
		const isDisabled = !selectedCountry || !selectedState;
		const requiredRule = selectedCountry
			? getRequiredRule(field, `The field ${field.label} is required`)
			: false;
		const handleSelectionChange = (selectedOption, onChange) => {
			onChange(selectedOption?.name || "");
		};

		return (
			<LocationSelectField
				containerClass={containerClass}
				fieldName={fieldName}
				selectInstanceId={selectInstanceId}
				control={control}
				requiredRule={requiredRule}
				options={cities}
				onSelectionChange={handleSelectionChange}
				onCreateOption={handleCreateCity}
				placeholder={
					isDisabled
						? "Select country and state first"
						: field.placeholder || "Select or create city"
				}
				selectClassName={clsx(
					SELECT_CLASS_NAME,
					hasError && "border-red-500",
					isDisabled && "opacity-50 cursor-not-allowed",
				)}
				isLoading={loadingCities}
				isDisabled={isDisabled || loadingCities}
			/>
		);
	}

	if (field.type === "fileupload") {
		const fileKey = normalize(field.label);
		return (
			<FileUploadField
				containerClass={containerClass}
				field={field}
				fieldName={fieldName}
				inputId={`file-${fileKey}`}
				register={register}
				commonRegisterRules={commonRegisterRules}
				hasError={hasError}
				errorMessage={errors[fieldName]?.message}
				fileName={fileNames[fileKey]}
				onFileNameChange={(nextFileName) =>
					setFileNames((prev) => ({
						...prev,
						[fileKey]: nextFileName,
					}))
				}
			/>
		);
	}

	if (field.type === "select") {
		const selectWidthClass = getSelectWidthClass(field.cssClass);
		const selectContainerClass = `input-container ${selectWidthClass} mt-4`;
		const selectInstanceId = `contact-form-select-${field.id}`;
		const isSingleSelection = true; //field?.cssClass?.includes("single_option");
		const selectOptions =
			field.choices?.map((choice) => ({
				value: choice.value ?? choice.text,
				label: choice.text,
			})) || [];

		return (
			<div className={selectContainerClass}>
				<Controller
					name={fieldName}
					control={control}
					rules={{
						required: getRequiredRule(field, `The field ${field.label} is required`),
					}}
					render={({ field: { onChange, value, ref } }) => (
						<ContactSelect
							instanceId={selectInstanceId}
							inputId={`${selectInstanceId}-input`}
							selectRef={ref}
							isClearable
							isMulti={!isSingleSelection}
							options={selectOptions}
							value={
								isSingleSelection
									? selectOptions.find((option) => option.value === value) || null
									: selectOptions.filter((option) => value?.includes(option.value))
							}
							onChange={(selectedOption) => {
								if (isSingleSelection) {
									onChange(selectedOption?.value || "");
									return;
								}
								onChange(
									selectedOption
										? selectedOption.map((option) => option.value)
										: [],
								);
							}}
							placeholder={field.placeholder || `Select ${field.label}`}
							classNamePrefix="react-select"
							className={clsx(SELECT_CLASS_NAME, hasError && "border-red-500")}
							menuListProps={{ "data-lenis-prevent": "true" }}
						/>
					)}
				/>
			</div>
		);
	}

	if (field.type === "date") {
		return (
			<DateField
				field={field}
				containerClass={containerClass}
				control={control}
				arrivalRef={arrivalRef}
				departureRef={departureRef}
				arrivalDate={arrivalDate}
				departureDate={departureDate}
				setArrivalDate={setArrivalDate}
				setDepartureDate={setDepartureDate}
				setValue={setValue}
				today={today}
				baseInputClass={baseInputClass}
				errorClass={errorClass}
				hasError={hasError}
			/>
		);
	}

	if (field.type === "radio") {
		return (
			<ChoiceField
				field={field}
				fieldName={fieldName}
				containerClass={containerClass}
				hasError={hasError}
				control={control}
				normalize={normalize}
				mode="radio"
			/>
		);
	}

	if (field.type === "checkbox" && field?.cssClass?.includes("agree_terms_conditions")) {
		return (
			<ChoiceField
				field={field}
				fieldName={fieldName}
				containerClass={containerClass}
				hasError={hasError}
				control={control}
				normalize={normalize}
				mode="checkbox_terms"
				errorMessage={errors[fieldName]?.message}
			/>
		);
	}

	if (field.type === "checkbox") {
		return (
			<ChoiceField
				field={field}
				fieldName={fieldName}
				containerClass={containerClass}
				hasError={hasError}
				control={control}
				normalize={normalize}
				mode="checkbox"
			/>
		);
	}

	if (field.type === "textarea") {
		return (
			<TextAreaField
				containerClass={containerClass}
				field={field}
				hasError={hasError}
				errorClass={errorClass}
				register={register}
				fieldName={fieldName}
				commonRegisterRules={commonRegisterRules}
			/>
		);
	}

	return (
		<TextInputField
			containerClass={containerClass}
			baseInputClass={baseInputClass}
			hasError={hasError}
			errorClass={errorClass}
			field={field}
			type={type}
			register={register}
			fieldName={fieldName}
			commonRegisterRules={commonRegisterRules}
		/>
	);
}

FieldRenderer.propTypes = {
	field: PropTypes.object.isRequired,
	control: PropTypes.object.isRequired,
	errors: PropTypes.object,
	errorClass: PropTypes.string.isRequired,
	register: PropTypes.func.isRequired,
	normalize: PropTypes.func.isRequired,
	baseInputClass: PropTypes.string.isRequired,
	setValue: PropTypes.func.isRequired,
	TYPE_TO_INPUT: PropTypes.object.isRequired,
	countries: PropTypes.array,
	states: PropTypes.array,
	cities: PropTypes.array,
	loadingCountries: PropTypes.bool,
	loadingStates: PropTypes.bool,
	loadingCities: PropTypes.bool,
	selectedCountry: PropTypes.string,
	selectedState: PropTypes.string,
	setCountryId: PropTypes.func.isRequired,
	setStateId: PropTypes.func.isRequired,
	handleCreateCity: PropTypes.func.isRequired,
	handleCreateCountry: PropTypes.func.isRequired,
	handleCreateState: PropTypes.func.isRequired,
	arrivalDate: PropTypes.instanceOf(Date),
	setArrivalDate: PropTypes.func.isRequired,
	departureDate: PropTypes.instanceOf(Date),
	setDepartureDate: PropTypes.func.isRequired,
	arrivalRef: PropTypes.object,
	departureRef: PropTypes.object,
	today: PropTypes.instanceOf(Date).isRequired,
	fileNames: PropTypes.object,
	setFileNames: PropTypes.func.isRequired,
	dict: PropTypes.object,
};

FieldRenderer.defaultProps = {
	errors: {},
	countries: [],
	states: [],
	cities: [],
	loadingCountries: false,
	loadingStates: false,
	loadingCities: false,
	selectedCountry: "",
	selectedState: "",
	arrivalDate: null,
	departureDate: null,
	arrivalRef: null,
	departureRef: null,
	fileNames: {},
	dict: {},
};
