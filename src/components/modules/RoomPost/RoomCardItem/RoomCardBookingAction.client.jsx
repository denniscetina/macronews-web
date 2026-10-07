"use client";

import BtnAnimated from "@/components/utils/ButtonAnimated/BtnAnimated";
import { useSiteInit } from "@/context/SiteInitProvider";

export default function RoomCardBookingAction({
	roomSlug,
	label,
	className = "w-auto lg:w-max",
}) {
	const { resolveRoomBookingLink } = useSiteInit();
	const bookingUrl = resolveRoomBookingLink(roomSlug);
	const normalizedBookingUrl =
		typeof bookingUrl === "string" ? bookingUrl.trim() : "";

	if (!label || !normalizedBookingUrl || normalizedBookingUrl === "#") {
		return null;
	}

	const isExternalBookingLink = /^https?:\/\//i.test(normalizedBookingUrl);

	return (
		<BtnAnimated
			styleButton="solid"
			isbuttonLink
			isExternalLink={isExternalBookingLink}
			className={className}
			button={{
				title: label,
				url: normalizedBookingUrl,
				target: isExternalBookingLink ? "_blank" : "_self",
			}}
		/>
	);
}
