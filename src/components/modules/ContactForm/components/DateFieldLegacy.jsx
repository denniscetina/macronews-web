import dayjs from "dayjs";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import { Controller } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";

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
	const fieldName = field.label;
	const isArrival = arrivalRef?.id === field.id;
	const isDeparture = departureRef?.id === field.id;
	const isRangeDate = Boolean(arrivalRef && departureRef);

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
				render={({ field: { value, onChange, ref } }) => {
					const selectedDate =
						(isArrival ? arrivalDate : isDeparture ? departureDate : null) ||
						(value ? dayjs(value, "MM/DD/YYYY").toDate() : null);

					const handleChange = (date) => {
						const formatted = date ? dayjs(date).format("MM/DD/YYYY") : "";
						onChange(formatted);

						if (!isRangeDate) {
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
					};

					const minDate = isRangeDate && isDeparture && arrivalDate ? arrivalDate : today;

					return (
						<DatePicker
							allowSameDay={false}
							placeholderText={field.placeholder || field.label}
							className={`${baseInputClass} ${hasError ? errorClass : ""}`}
							calendarClassName="calendarFormContact"
							wrapperClassName="w-full"
							selected={selectedDate}
							onChange={handleChange}
							selectsStart={isRangeDate && isArrival ? true : undefined}
							selectsEnd={isRangeDate && isDeparture ? true : undefined}
							startDate={isRangeDate ? arrivalDate : undefined}
							endDate={isRangeDate ? departureDate : undefined}
							minDate={minDate}
							dateFormat="MM/dd/yyyy"
							ref={ref}
						/>
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
