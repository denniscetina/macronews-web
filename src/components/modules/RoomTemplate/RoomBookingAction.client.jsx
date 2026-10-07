"use client";

import BtnAnimated from "@/components/utils/ButtonAnimated/BtnAnimated";
import { useSiteInit } from "@/context/SiteInitProvider";

export default function RoomBookingAction({ roomSlug, label }) {
	const { isSiteInitLoading, resolveRoomBookingLink } = useSiteInit();
	const ctaUrl = resolveRoomBookingLink(roomSlug);
	const hasCtaError = !isSiteInitLoading && !ctaUrl;

	if (hasCtaError) {
		return null;
	}

	return (
		<BtnAnimated
			styleButton="outlined"
			isbuttonLink
			dataAtributes={{
				"data-loading": isSiteInitLoading ? "true" : "false",
			}}
			IsDisabled={isSiteInitLoading}
			IsLoading={isSiteInitLoading}
			isExternalLink
			button={{
				title: label,
				className: "w-full lg:w-auto uppercase",
				url: ctaUrl || "/#",
				target: "_blank",
			}}
		/>
	);
}
