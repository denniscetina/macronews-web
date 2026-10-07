// assets
// utils
import { sanitizeHtml } from "../../../utils/SanitizeHtml/SanitizeHtml";
import OfferBookingAction from "./OfferBookingAction.client";
import OfferDetailsLink from "./OfferDetailsLink";
import clsx from "clsx";
import { createTranslator } from "@/lib/i18n/translator";

const getOfferImage = (item) => {
	const listingImage = item?.listingImage;

	return listingImage?.desktop ?? listingImage?.tablet ?? listingImage?.mobile ?? null;
};

export default function OfferCardItem({ item, itemIndex = 0, dict = {} }) {
	const t = createTranslator(dict);
	const descriptionItem = sanitizeHtml(item?.summary || "");
	const bookingButtonText =
		typeof item?.bookingButtonLabel === "string" && item.bookingButtonLabel.trim() !== ""
			? item.bookingButtonLabel.trim()
			: "Book Now";
	const detailsLink = item?.permalink || (item?.slug ? `/offers/${item.slug}/` : "#");
	const openInNewTab = item?.openBookingLinksInNewTab === true;
	const offerImage = getOfferImage(item);
	const isImageFirst = itemIndex % 2 !== 0;

	return (
		<div
			data-component="OfferCardItem"
			className={`flex flex-col ${isImageFirst ? "lg:flex-row" : "lg:flex-row-reverse"} mx-8 mb-8 gap-0 justify-center items-center sm:w-[80%] lg:max-w-[1153px] h-auto lg:h-[660px] bg bg-[#F7F4F0] overflow-hidden shadow-2xl`}
		>
			<div className="w-full h-[500px] lg:w-1/2 lg:h-full">
				{offerImage ? (
					<img
						src={offerImage.url}
						alt={offerImage.alt || item?.title || "Offer image"}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="w-full h-full bg-[#e9e5df] flex items-center justify-center text-[#253746]/60">

					</div>
				)}
			</div>

			<div className="h-auto lg:h-full w-full lg:w-1/2 flex flex-col items-start self-stretch justify-center gap-6 p-6 md:p-8 lg:p-12 $xl:p-30 $xl:pl-24">
				<div className="flex flex-col gap-4 lg:gap-6 items-start self-stretch w-full max-w-[500px]">
					{item.title && (
						<h3 className="text-2xl text-secondary font-glosa leading-[120%] capitalize [leading-trim:both] [text-edge:cap]">
							{item.title}
						</h3>
					)}
					{item.subtitle && (
						<h3 className="font-normal text-[16px] tracking-[2.4px] text-[#253746] leading-[100%] uppercase [leading-trim:both] [text-edge:cap]">
							{item.subtitle}
						</h3>
					)}
				</div>
				<div className="flex flex-row gap-2 justify-start w-full">
					{item?.summary && (
						<div
							className={clsx(
								"prose #container-description-card-swiper max-w-5xl text-sm sm:text-base md:text-lg font-futura font-normal !text-[18px] w-full",
								"prose-p:text-[18px] prose-p:leading-[160%] prose-p:[leading-trim:both] prose-p:[text-edge:cap] prose-p:text-[#757575]",
								"prose-ul:list-disc prose-ul:list-inside prose-ul:my-1 prose-ul:space-y-1 prose-ul:[leading-trim:both] prose-ul:[text-edge:cap]",
								"prose-li:leading-[160%] prose-li:[leading-trim:both] prose-li:[text-edge:cap] prose-li:pl-2 prose-li:text-[#757575]",
								"prose-strong:font-futura prose-strong:font-[450] prose-strong:leading-[160%] prose-strong:text-[#5C6974]"
							)}
							style={{ maxHeight: "250px", overflowY: "auto" }}
							dangerouslySetInnerHTML={{
								__html: descriptionItem,
							}}
						/>
					)}
				</div>

				<div className="w-full md:w-fit flex justify-center">
					<OfferDetailsLink
						href={detailsLink}
						label={t("OfferCardItem.OfferCardActionsClient.lbl_details", "Details")}
						className="flex py-2 px-1.5 justify-center items-center gap-2 border-b-black"
					/>
					<OfferBookingAction
						offerSlug={item?.slug}
						bookingButtonText={bookingButtonText}
						openInNewTab={openInNewTab}
					/>
				</div>
			</div>
		</div>
	);
}
