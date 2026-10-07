"use client";

import PropTypes from "prop-types";
import head from "lodash/head";
import isEmpty from "lodash/isEmpty";
import values from "lodash/values";
import { useEffect, useState } from "react";
import Image from "next/image";
import logoIcon from "@/assets/img/shape-orange.svg";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { useContactForm } from "./hooks/useContactForm";
import FieldRenderer from "./FieldRenderer";
import useLenisPreventOnSelectMenus from "./hooks/useLenisPreventOnSelectMenus";
import FormAlert from "./components/FormAlert";

ContactForm.propTypes = {
	data: PropTypes.object,
	formSchema: PropTypes.object,
	dict: PropTypes.object,
};

export default function ContactForm({ data, formSchema, dict = {} }) {
	const [fileNames, setFileNames] = useState({});
	const {
		isValid,
		fields,
		formData,
		message,
		showMessage,
		formAlert,
		loading,
		errorClass,
		errors,
		baseInputClass,
		arrivalDate,
		setArrivalDate,
		departureDate,
		setDepartureDate,
		arrivalRef,
		departureRef,
		control,
		normalize,
		onSubmit,
		register,
		handleSubmit,
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
	} = useContactForm({
		formSchema,
		formId: data?.form_id,
		i18nMessages: dict?.hooks?.useContactForm,
	});

	const { RenderRecaptcha, verified } = useRecaptcha();
	const today = new Date(new Date().setHours(0, 0, 0, 0));

	useLenisPreventOnSelectMenus();

	useEffect(() => {
		import("./forms.css");
	}, []);

	const hasStayLikeHeader = Boolean(data?.description || data?.logo?.url);

	const renderField = (field, index) => (
		<FieldRenderer
			key={`${field?.id ?? field?.label ?? "field"}-${index}`}
			field={field}
			control={control}
			errors={errors}
			errorClass={errorClass}
			register={register}
			normalize={normalize}
			baseInputClass={baseInputClass}
			setValue={setValue}
			TYPE_TO_INPUT={TYPE_TO_INPUT}
			countries={countries}
			states={states}
			cities={cities}
			loadingCountries={loadingCountries}
			loadingStates={loadingStates}
			loadingCities={loadingCities}
			selectedCountry={selectedCountry}
			selectedState={selectedState}
			setCountryId={setCountryId}
			setStateId={setStateId}
			handleCreateCity={handleCreateCity}
			handleCreateCountry={handleCreateCountry}
			handleCreateState={handleCreateState}
			arrivalDate={arrivalDate}
			setArrivalDate={setArrivalDate}
			departureDate={departureDate}
			setDepartureDate={setDepartureDate}
			arrivalRef={arrivalRef}
			departureRef={departureRef}
			today={today}
			fileNames={fileNames}
			setFileNames={setFileNames}
			dict={dict}
		/>
	);

	return (
		<section data-component="ContactForm" className="contact-form-universal my-8 lg:my-16 flex justify-center mx-5">
			<div className="flex w-[1153px] py-16 px-4 flex-col items-center gap-8 bg-[#FFF]">
				<div className="flex flex-col justify-center items-center self-stretch gap-8 sm:px-4">
					<div className="flex flex-col justify-center items-center self-stretch gap-2.5">
						{data?.logo?.url ? (
							<Image src={data.logo.url} alt="logo" className="max-h-8 max-w-8" />
						) : (
							<Image src={logoIcon} alt="logo" className="max-h-16 object-contain" />
						)}
						{data?.title && (
							<div>
								<h3
									className="text-[#253746] text-center font-glosa leading-7"
									style={{
										letterSpacing: "-0.48px",
										fontSize: "24px",
										fontWeight: 500,
									}}
								>
									{data.title}
								</h3>
							</div>
						)}
					</div>

					{data?.description && (
						<div
							style={{ maxWidth: "800px" }}
							className={`wysiwyg font-futura text-[20px] font-normal leading-[160%] text-[#5C6974] ${
								hasStayLikeHeader ? "" : "hidden"
							}`}
							dangerouslySetInnerHTML={{ __html: data.description }}
						/>
					)}
				</div>

				<div className="form-container-universal flex flex-wrap w-full max-w-[800px]">
					<form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap w-full gap-4 mb-8 md:mb-16">
						{fields.map(renderField)}
						{RenderRecaptcha}
						{formData?.button && (
							<div className="w-full flex justify-center pt-8">
								<button
									disabled={loading || !isValid || !verified}
									className="flex px-6 py-3 justify-center items-center gap-2 bg-secondary text-[#FFF] font-medium hover:bg-opacity-90 hover:cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
									type="submit"
								>
									{loading ? "Sending..." : formData.button.text}
								</button>
							</div>
						)}
					</form>
					{!isEmpty(errors) && (
						<div
							className="flex justify-center self-stretch w-full p-4 my-4 mx-6 text-sm text-red-800 rounded-lg bg-red-50"
							role="alert"
						>
							<span className="font-medium mr-6">Error: </span>
							{head(values(errors))?.message}
						</div>
					)}
					{showMessage && (
						<FormAlert {...formAlert} />
					)}
				</div>
			</div>
		</section>
	);
}
