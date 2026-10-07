import { sanitizeHtml } from "@/components/utils/SanitizeHtml/SanitizeHtml";
import OfferCardItem from "./OfferCardItem";
import { createTranslator } from "@/lib/i18n/translator";

const VALID_HEADING_LEVELS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const normalizeDisplayOrder = (displayOrder) =>
	typeof displayOrder === "string" ? displayOrder.trim().toLowerCase() : "";

const toDateValue = (value) => {
	if (typeof value !== "string" || value.trim() === "") {
		return 0;
	}

	const normalized = value.replace(" ", "T");
	const date = new Date(normalized);

	return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

function sortOffers(offers, normalizedDisplayOrder) {
	if (!Array.isArray(offers)) {
		return [];
	}

	if (normalizedDisplayOrder === "alphabetical") {
		return [...offers].sort((offerA, offerB) => {
			const titleA = String(offerA?.title ?? "");
			const titleB = String(offerB?.title ?? "");

			return titleA.localeCompare(titleB, undefined, {
				sensitivity: "base",
			});
		});
	}

	if (normalizedDisplayOrder === "recently_updated") {
		return [...offers].sort((offerA, offerB) => {
			const offerADate = toDateValue(offerA?.startDate || offerA?.expirationDate);
			const offerBDate = toDateValue(offerB?.startDate || offerB?.expirationDate);

			return offerBDate - offerADate;
		});
	}

	return offers;
}

export default function OffersList({ data, dict = {} }) {
	const t = createTranslator(dict);
	const heading = data?.heading || data?.title;
	const headingLevel =
		typeof data?.headingLevel === "string"
			? data.headingLevel.trim().toLowerCase()
			: "";
	const HeadingTag = VALID_HEADING_LEVELS.has(headingLevel) ? headingLevel : "h3";
	const showSectionHeader = data?.displaySectionHeader !== false;
	const description = typeof data?.description === "string" ? data.description : "";
	const normalizedDisplayOrder = normalizeDisplayOrder(data?.displayOrder);
	const offers = sortOffers(data?.offers, normalizedDisplayOrder);

	if (offers.length === 0) {
		return (
			<section data-component="OffersList" className="relative overflow-hidden w-full flex flex-col gap-8 lg:gap-16 items-center justify-center bg-[#FDFCFC] py-16">
				<div className="flex flex-col lg:flex-row mx-8 mb-8 gap-0 justify-center items-center sm:w-[80%] lg:max-w-[1153px] h-auto lg:h-[260px] bg-[#F7F4F0] overflow-hidden shadow-2xl">
					<div className="h-auto lg:h-full w-full flex flex-col items-center justify-center gap-6 p-6">
						<div className="flex flex-col gap-4 lg:gap-6 items-center justify-center self-stretch">
							<h3 className="text-2xl text-secondary font-glosa leading-[120%] capitalize [leading-trim:both] [text-edge:cap]">
								{t(
									"self.msg_there_no_offers_available_now",
									"There are no offers available now",
								)}
							</h3>
							<p className="font-normal text-[16px] text-center tracking-[1.2px] text-[#253746] leading-[140%]">
								{t(
									"self.lbl_please_check_back_later_new_offers_promotions",
									"Please check back later for new offers and promotions.",
								)}
							</p>
						</div>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section data-component="OffersList" className="relative overflow-hidden w-full flex flex-col gap-8 lg:gap-16 items-center justify-center bg bg-[#FDFCFC] py-16">
			{showSectionHeader && (heading || description) && (
				<div className="inner-container flex flex-col gap-[16px] justify-center items-center text-center mb-6">
					{heading && (
						<HeadingTag className="header-6 lg:header-5 !font-futura uppercase !leading-[20px] !tracking-[2.4px]">
							{heading}
						</HeadingTag>
					)}
					{description && (
						<div
							className="wysiwyg"
							dangerouslySetInnerHTML={{
								__html: sanitizeHtml(description),
							}}
						/>
					)}
				</div>
			)}
			{offers.map((item, index) => (
				<OfferCardItem
					item={item}
					itemIndex={index}
					dict={dict}
					key={item?.id || item?.slug || index}
				/>
			))}
		</section>
	);
}
