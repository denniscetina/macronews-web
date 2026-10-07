import dayjs from "dayjs";
import localeES from "dayjs/locale/es";

export const toValidDate = (value) => {
	if (!value) {
		return null;
	}

	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = dayjs(value);
		if (parsed.isValid()) {
			return parsed.toDate();
		}
	}

	return null;
};

export const formatRangeLabel = ({
	arrival,
	departure,
	departurePlaceholder = "Select departure",
	locale = "en"
}) => {
	dayjs.locale(locale);
	const formattedArrival = dayjs(arrival).format("ddd MMM DD");

	if (!(departure instanceof Date) || Number.isNaN(departure.getTime())) {
		return `${formattedArrival} - ${departurePlaceholder}`;
	}

	return `${formattedArrival} - ${dayjs(departure).format("ddd MMM DD")}`;
};
