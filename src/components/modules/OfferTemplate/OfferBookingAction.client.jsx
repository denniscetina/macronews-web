"use client";

import BtnAnimated from "@/components/utils/ButtonAnimated/BtnAnimated";
import { useSiteInit } from "@/context/SiteInitProvider";

export default function OfferBookingAction({
	offerSlug,
	bookingButtonText,
	openInNewTab,
}) {
	const { resolveOfferBookingLink } = useSiteInit();
	const bookingUrl = resolveOfferBookingLink(offerSlug);
	const hasBookingUrl =
		typeof bookingUrl === "string" &&
		bookingUrl.trim() !== "" &&
		bookingUrl !== "/#";

	if (!hasBookingUrl) {
		return null;
	}

	return (
		<BtnAnimated
			styleButton="outline"
			isExternalLink={openInNewTab}
			className="w-auto lg:w-max"
			button={{
				title: bookingButtonText,
				url: bookingUrl,
				target: openInNewTab ? "_blank" : "_self",
			}}
		/>
	);
}
