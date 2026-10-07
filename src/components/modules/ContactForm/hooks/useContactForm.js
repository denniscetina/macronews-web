import Axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { GetCity, GetCountries, GetState } from "react-country-state-city";
import { useForm } from "react-hook-form";
import { createTranslator } from "@/lib/i18n/translator";
import { getFieldName } from "../utils/fieldHelpers";

const normalize = (str = "") =>
	String(str)
		.replace(/[^a-z0-9]/gi, "")
		.toLowerCase();

const normalizeFormValue = (value) => {

	if (typeof FileList !== "undefined" && value instanceof FileList) {
		return value?.[0]?.name ?? "";
	}

	if (typeof File !== "undefined" && value instanceof File) {
		return value.name;
	}

	if (value === null || value === undefined) {
		return "";
	}

	return value;
};

const buildPayload = (rawValues, fields) => {
	const information = {};
	const cleanFields = fields.filter((field) => field.type !== "section");
	Object.entries(rawValues).forEach(([key, rawValue]) => {
		const match = cleanFields.find(
			(field) => normalize(getFieldName(field)) === normalize(key),
		);
		if (!match) {
			return;
		}
		const value = normalizeFormValue(rawValue);
		const targetId = String(match.id);
		if(match.inputType === "checkbox") {
			if(Array.isArray(match.inputs)) {
				//find the checkbox object value in match.inputs to get the id for information[id]
				value.forEach((answer) => {
					const input= match.inputs.find((item) => item.label === answer);
					information[input.id] = input.label;
				})
				return;
			}
		}
		if (match.inputType === "number" && value !== "") {
			const parsed = Number.parseInt(value, 10);
			information[targetId] = Number.isFinite(parsed) ? parsed : value;
			return;
		}

		information[targetId] = value;
	});

	return information;
};

export const useContactForm = ({ formSchema, formId, i18nMessages = {} }) => {
	const t = createTranslator(i18nMessages);
	const messages = useMemo(
		() => ({
			successSubmittingForm: t("msg_success_submiting_form", "Formulario enviado correctamente."),
			errorLoadingCountries: t("msg_error_loading_countries", "Error loading countries:"),
			errorLoadingStates: t("msg_error_loading_states", "Error loading states:"),
			errorLoadingCities: t("msg_error_loading_cities", "Error loading cities:"),
			errorSubmittingForm: t("msg_error_submitting_form", "Error submitting form."),
		}),
		[t],
	);
	const {
		watch,
		register,
		handleSubmit,
		reset,
		setValue,
		control,
		formState: { errors, isValid },
	} = useForm({
		mode: "onChange",
		reValidateMode: "onChange",
		defaultValues: {
			Country: "",
			"State/ Province": "",
			City: "",
		},
	});

	const formData = useMemo(() => formSchema ?? null, [formSchema]);
	const fields = useMemo(() => formData?.fields ?? [], [formData]);
	const [loading, setLoading] = useState(false);

	const [formAlert, setFormAlert] = useState({
		type: "error",
		message: messages.errorSubmittingForm
	});
	const [message, setMessage] = useState("");
	const [showMessage, setShowMessage] = useState(false);


	const [arrivalDate, setArrivalDate] = useState(null);
	const [departureDate, setDepartureDate] = useState(null);

	const [countries, setCountries] = useState([]);
	const [states, setStates] = useState([]);
	const [cities, setCities] = useState([]);
	const [loadingCountries, setLoadingCountries] = useState(false);
	const [loadingStates, setLoadingStates] = useState(false);
	const [loadingCities, setLoadingCities] = useState(false);
	const [countryId, setCountryId] = useState(null);
	const [stateId, setStateId] = useState(null);

	const selectedCountry = watch("Country");
	const selectedState = watch("State/ Province");

	const hasCountryField = useMemo(
		() => fields.some((field) => field?.label === "Country"),
		[fields],
	);

	useEffect(() => {
		if (!hasCountryField) {
			return;
		}

		const fetchCountries = async () => {
			setLoadingCountries(true);
			try {
				const response = await GetCountries();
				const formattedCountries = response.map((country) => ({
					value: country.id,
					label: country.name,
					name: country.name,
					isoCode: country.iso3,
				}));
				setCountries(formattedCountries);
			} catch (error) {
				console.error(messages.errorLoadingCountries, error);
			} finally {
				setLoadingCountries(false);
			}
		};

		fetchCountries();
	}, [hasCountryField, messages.errorLoadingCountries]);

	useEffect(() => {
		if (!selectedCountry || !countries.length) {
			return;
		}

		const matchedCountry = countries.find(
			(country) => country.name === selectedCountry,
		);

		if (matchedCountry && matchedCountry.value !== countryId) {
			setCountryId(matchedCountry.value);
		}
	}, [selectedCountry, countries, countryId]);

	useEffect(() => {
		const loadStates = async () => {
			if (!selectedCountry || !countryId) {
				setStates([]);
				setCities([]);
				setStateId(null);
				return;
			}

			setLoadingStates(true);
			try {
				const statesData = await GetState(countryId);
				const formattedStates = statesData.map((state) => ({
					value: state.id,
					label: state.name,
					name: state.name,
				}));
				setStates(formattedStates);
				setCities([]);
			} catch (error) {
				console.error(messages.errorLoadingStates, error);
			} finally {
				setLoadingStates(false);
			}
		};

		loadStates();
	}, [countryId, messages.errorLoadingStates, selectedCountry]);

	useEffect(() => {
		if (!selectedState || !states.length) {
			return;
		}

		const matchedState = states.find((state) => state.name === selectedState);

		if (matchedState && matchedState.value !== stateId) {
			setStateId(matchedState.value);
		}
	}, [selectedState, states, stateId]);

	useEffect(() => {
		const loadCities = async () => {
			if (!countryId || !stateId) {
				setCities([]);
				return;
			}

			setLoadingCities(true);
			try {
				const citiesData = await GetCity(countryId, stateId);
				const formattedCities = citiesData.map((city) => ({
					value: city.id,
					label: city.name,
					name: city.name,
				}));
				setCities(formattedCities);
			} catch (error) {
				console.error(messages.errorLoadingCities, error);
			} finally {
				setLoadingCities(false);
			}
		};

		loadCities();
	}, [countryId, messages.errorLoadingCities, stateId]);

	const dateFields = useMemo(() => {
		const dates = fields.filter((field) => field.type === "date");
		return {
			arrival: dates[0] ? { id: dates[0].id, name: dates[0].label } : null,
			departure: dates[1] ? { id: dates[1].id, name: dates[1].label } : null,
		};
	}, [fields]);

	const onSubmit = async (values) => {
		if (!formId) {
			return;
		}
		const formData = buildPayload(values, fields);
		setLoading(true);
		try {
			const response = await Axios.post(`/api/forms/${formId}/submit`, formData);
			if(response.status !== 200) {
				setFormAlert({
					type: "error",
					message: messages.errorSubmittingForm,
				});
				setShowMessage(true);
				return;
			}
			setFormAlert({
				type: "success",
				message: messages.successSubmittingForm,
			});
			setShowMessage(true);
			reset();
			setArrivalDate(null);
			setDepartureDate(null);
			setCountryId(null);
			setStateId(null);
		} catch (error) {
			setFormAlert({
				type: "error",
				message: messages.errorSubmittingForm,
			});
			setShowMessage(true)
			console.message(messages.errorSubmittingForm, error);
		} finally {
			setLoading(false);
			setTimeout(() => {
				setShowMessage(false);
			}, 7500);
		}
	};

	const TYPE_TO_INPUT = {
		text: "text",
		email: "email",
		number: "number",
		phone: "number",
		date: "text",
		name: "text",
	};

	const baseInputClass =
		"text-[#253746] font-futura font-normal leading-6 h-[40px] w-full";
	const errorClass = "border-red-500";

	const handleCreateCountry = (inputValue) => {
		const newOption = {
			value: inputValue.toLowerCase().replace(/\s+/g, "-"),
			name: inputValue,
			label: inputValue,
			isNew: true,
		};

		setValue("Country", inputValue, { shouldValidate: true });
		setCountryId(newOption.value);
		setValue("State/ Province", "", { shouldValidate: true });
		setValue("City", "", { shouldValidate: true });
		setStateId(null);
		return newOption;
	};

	const handleCreateState = (inputValue) => {
		const newOption = {
			value: inputValue.toLowerCase().replace(/\s+/g, "-"),
			name: inputValue,
			label: inputValue,
			isNew: true,
		};

		setValue("State/ Province", inputValue, { shouldValidate: true });
		setStateId(newOption.value);
		setValue("City", "", { shouldValidate: true });
		return newOption;
	};

	const handleCreateCity = (inputValue) => {
		const newOption = {
			value: inputValue.toLowerCase().replace(/\s+/g, "-"),
			name: inputValue,
			label: inputValue,
			isNew: true,
		};

		setValue("City", inputValue, { shouldValidate: true });
		return newOption;
	};

	return {
		countries,
		states,
		cities,
		loadingCountries,
		loadingStates,
		loadingCities,
		selectedCountry,
		selectedState,
		isValid,
		fields,
		formData,
		showMessage,
		message,
		formAlert,
		loading,
		errorClass,
		errors,
		baseInputClass,
		arrivalDate,
		setArrivalDate,
		departureDate,
		setDepartureDate,
		arrivalRef: dateFields.arrival,
		departureRef: dateFields.departure,
		normalize,
		onSubmit,
		register,
		handleSubmit,
		setValue,
		control,
		TYPE_TO_INPUT,
		setCountryId,
		setStateId,
		handleCreateCity,
		handleCreateCountry,
		handleCreateState,
	};
};

export default useContactForm;
