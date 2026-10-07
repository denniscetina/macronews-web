import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { DayPicker, getDefaultClassNames, UI } from "react-day-picker";
import { Controller } from "react-hook-form";
import "react-day-picker/style.css";

const DATE_INPUT_PATTERN = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

const toFormDateString = (date) => (date ? dayjs(date).format("MM/DD/YYYY") : "");

const parseFormDate = (value) => {
	if (!value || !DATE_INPUT_PATTERN.test(value)) {
		return null;
	}

	const parsedDate = dayjs(value, "MM/DD/YYYY");
	return parsedDate.isValid() ? parsedDate.toDate() : null;
};

export default function DateField({
	field,
	containerClass,
	control,
	arrivalRef,
	departureRef,
	arrivalDate,
	departureDate,
	setArrivalDate,
	setDepartureDate,
	setValue,
	today,
	baseInputClass,
	errorClass,
	hasError,
}) {
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [month, setMonth] = useState(today);
	const containerRef = useRef(null);
	const defaultClassNames = getDefaultClassNames();
	const fieldName = field.label;
	const isArrival = arrivalRef?.id === field.id;
	const isDeparture = departureRef?.id === field.id;
	const isRangeDate = Boolean(arrivalRef && departureRef);

	useEffect(() => {
		if (!isCalendarOpen) {
			return undefined;
		}

		const handleDocumentMouseDown = (event) => {
			if (containerRef.current?.contains(event.target)) {
				return;
			}

			setIsCalendarOpen(false);
		};

		const handleDocumentKeyDown = (event) => {
			if (event.key === "Escape") {
				setIsCalendarOpen(false);
			}
		};

		document.addEventListener("mousedown", handleDocumentMouseDown);
		document.addEventListener("keydown", handleDocumentKeyDown);

		return () => {
			document.removeEventListener("mousedown", handleDocumentMouseDown);
			document.removeEventListener("keydown", handleDocumentKeyDown);
		};
	}, [isCalendarOpen]);

	return (
		<div className={containerClass}>
			<Controller
				name={fieldName}
				control={control}
				defaultValue={field.defaultValue || ""}
				rules={{
					required: field.isRequired
						? field.errorMessage || `The field ${field.label} is required`
						: false,
					validate: (value) => {
						if (!isRangeDate) {
							return true;
						}

						const parsedValue = value ? dayjs(value, "MM/DD/YYYY").toDate() : null;
						if (isArrival && parsedValue && departureDate && parsedValue > departureDate) {
							return "Arrival cannot be after departure";
						}
						if (isDeparture && parsedValue && arrivalDate && parsedValue < arrivalDate) {
							return "Departure cannot be before arrival";
						}
						return true;
					},
				}}
				render={({ field: { value, onChange, onBlur, ref } }) => {
					const selectedDate =
						(isArrival ? arrivalDate : isDeparture ? departureDate : null) ||
						parseFormDate(value);

					const minDate = null; //isRangeDate && isArrival ? today : isRangeDate && isDeparture && arrivalDate ? arrivalDate : null;

					const commitDate = (date, shouldCloseCalendar = false) => {
						const formatted = toFormDateString(date);
						onChange(formatted);

						if (!isRangeDate) {
							if (shouldCloseCalendar) {
								setIsCalendarOpen(false);
							}
							return;
						}

						if (isArrival) {
							setArrivalDate(date);
							if (departureDate && date && dayjs(date).isAfter(departureDate, "day")) {
								setDepartureDate(date);
								if (departureRef?.name) {
									setValue(departureRef.name, formatted, { shouldValidate: true });
								}
							}
						} else if (isDeparture) {
							setDepartureDate(date);
							if (arrivalDate && date && dayjs(date).isBefore(arrivalDate, "day")) {
								setArrivalDate(date);
								if (arrivalRef?.name) {
									setValue(arrivalRef.name, formatted, { shouldValidate: true });
								}
							}
						}

						if (shouldCloseCalendar) {
							setIsCalendarOpen(false);
						}
					};

					const handleInputChange = (event) => {
						const nextValue = event.target.value;
						onChange(nextValue);

						if (!nextValue) {
							if (isArrival) {
								setArrivalDate(null);
							} else if (isDeparture) {
								setDepartureDate(null);
							}
							return;
						}

						const parsedDate = parseFormDate(nextValue);
						if (!parsedDate) {
							return;
						}

						setMonth(dayjs(parsedDate).startOf("month").toDate());
						commitDate(parsedDate);
					};

					const handleCalendarSelect = (date) => {
						if (!date) {
							return;
						}

						setMonth(dayjs(date).startOf("month").toDate());
						commitDate(date, true);
					};

					const openCalendar = () => {
						setMonth(dayjs(selectedDate || minDate || today).startOf("month").toDate());
						setIsCalendarOpen(true);
					};

					return (
						<div ref={containerRef} className="relative w-full">
							<input
								ref={ref}
								type="text"
								value={value || ""}
								onChange={handleInputChange}
								onBlur={onBlur}
								onFocus={openCalendar}
								onClick={openCalendar}
								placeholder={field.placeholder || field.label}
								className={`${baseInputClass} ${hasError ? errorClass : ""}`}
								autoComplete="off"
							/>
							{isCalendarOpen && (
								<div
									className="absolute left-0 top-full z-50 mt-1 w-max min-w-full max-w-[calc(100vw-2rem)] bg-[#f9f9f9] shadow-xl"
									data-lenis-prevent="true"
								>
									<DayPicker
										mode="single"
										required
										navLayout="around"
										selected={selectedDate || undefined}
										onSelect={handleCalendarSelect}
										month={month}
										onMonthChange={setMonth}
										disabled={{ before: minDate }}
										classNames={{
											root: `calendarFormContact ${defaultClassNames.root} font-futura`,
											months: `${defaultClassNames.months} !w-full`,
											month_grid: "w-full",
											[UI.CaptionLabel]: `${defaultClassNames.caption_label} text-[18px] font-glosa uppercase leading-[40px] text-[#192a36] not-italic font-normal`,
											[UI.Weekday]: `${defaultClassNames.weekday} !capitalize`,
											[UI.Chevron]: `${defaultClassNames.chevron} !fill-[#192a36]`,
										}}
										modifiersClassNames={{
											today: "calendarFormContact-today",
											selected: "calendarFormContact-selected",
										}}
									/>
								</div>
							)}
						</div>
					);
				}}
			/>
		</div>
	);
}

DateField.propTypes = {
	field: PropTypes.object.isRequired,
	containerClass: PropTypes.string.isRequired,
	control: PropTypes.object.isRequired,
	arrivalRef: PropTypes.object,
	departureRef: PropTypes.object,
	arrivalDate: PropTypes.instanceOf(Date),
	departureDate: PropTypes.instanceOf(Date),
	setArrivalDate: PropTypes.func.isRequired,
	setDepartureDate: PropTypes.func.isRequired,
	setValue: PropTypes.func.isRequired,
	today: PropTypes.instanceOf(Date).isRequired,
	baseInputClass: PropTypes.string.isRequired,
	errorClass: PropTypes.string.isRequired,
	hasError: PropTypes.bool,
};

DateField.defaultProps = {
	arrivalRef: null,
	departureRef: null,
	arrivalDate: null,
	departureDate: null,
	hasError: false,
};
