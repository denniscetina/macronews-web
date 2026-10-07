import BookingWidgetMobileActionClient from "./MobileAction.client";

export default function BookingWidgetMobileAction({
	label = "Book Now",
	ariaLabel = "Open booking widget",
}) {
	return (
		<BookingWidgetMobileActionClient
			label={label}
			ariaLabel={ariaLabel}
		/>
	);
}
