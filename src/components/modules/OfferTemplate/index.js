import clsx from "clsx";
import TermsAndConditions from "@/components/modules/TermsAndConditions";
import { sanitizeHtml } from "@/components/utils/SanitizeHtml/SanitizeHtml";
import OfferBookingAction from "@/components/modules/OfferTemplate/OfferBookingAction.client";

const resolveResponsiveImages = (imageSet) => {
	if (!imageSet || typeof imageSet !== "object") {
		return {
			desktop: null,
			tablet: null,
			mobile: null,
			fallback: null,
		};
	}

	const fallbackAsset = imageSet?.url ? imageSet : null;
	const desktop = imageSet?.desktopImage || imageSet?.desktop || fallbackAsset;
	const tablet = imageSet?.tabletImage || imageSet?.tablet || null;
	const mobile = imageSet?.mobileImage || imageSet?.mobile || null;

	return {
		desktop,
		tablet,
		mobile,
		fallback: desktop || tablet || mobile || null,
	};
};

function ResponsivePicture({
	imageSet,
	alt,
	title,
	pictureClassName,
	imageClassName,
}) {
	const { desktop, tablet, mobile, fallback } = resolveResponsiveImages(imageSet);

	if (!fallback?.url) {
		return null;
	}

	return (
		<picture className={pictureClassName}>
			{mobile?.url && <source media="(max-width: 767px)" srcSet={mobile.url} />}
			{tablet?.url && <source media="(max-width: 1023px)" srcSet={tablet.url} />}
			{desktop?.url && <source media="(min-width: 1024px)" srcSet={desktop.url} />}
			<img
				className={imageClassName}
				title={title || fallback.title || undefined}
				src={fallback.url}
				alt={alt || fallback.alt || ""}
			/>
		</picture>
	);
}

const shouldOpenInNewTab = (value) => {
	if (value === true) {
		return true;
	}

	if (Array.isArray(value)) {
		return value.some((item) => {
			const token = String(item ?? "").trim().toLowerCase();
			return token === "yes" || token === "true" || token === "1";
		});
	}

	if (typeof value === "string") {
		const token = value.trim().toLowerCase();
		return token === "yes" || token === "true" || token === "1";
	}

	return false;
};

const buildTermsPayload = (data, site) => {
	const termsBlock = data?.termsAndConditions;
	const termsAndConditions = Array.isArray(termsBlock?.listOfTerms)
		? termsBlock.listOfTerms
		: Array.isArray(termsBlock)
			? termsBlock
			: [];

	if (!termsAndConditions.length) {
		return null;
	}

	return {
		logoTermsAndConditions:
			data?.logoTermsAndConditions || data?.logo || site?.assets?.urm_icon_copper,
		cardTitleTermsAndConditions:
			termsBlock?.title || data?.termsAndConditionsTitle || "Terms and Conditions",
		termsAndConditions,
		accordionMode: data?.accordionMode === true,
		backgroundColor: data?.backgroundColor || "accent",
	};
};

export default function OfferTemplate({ data, site }) {
	const heroImages = resolveResponsiveImages(data?.mainImage);
	const listingImages = resolveResponsiveImages(data?.listing_image || data?.listingImage);
	const cardLogo = data?.logo || site?.assets?.urm_icon_copper;
	const bookingButtonText =
		typeof data?.bookingButtonLabel === "string" && data.bookingButtonLabel.trim() !== ""
			? data.bookingButtonLabel.trim()
			: typeof data?.listingButtonLabel === "string" &&
				  data.listingButtonLabel.trim() !== ""
				? data.listingButtonLabel.trim()
				: "Book Now";
	const openInNewTab = shouldOpenInNewTab(data?.openBookingLinksInNewTab);
	const listingTitle = data?.listing_title || data?.title || "Offer";
	const subtitle = data?.subtitle || "";
	const summary = sanitizeHtml(data?.summary || "");
	const offerDetails = sanitizeHtml(data?.offerDetails || "");
	const termsData = buildTermsPayload(data, site);

	return (
		<section data-component="OfferTemplate">
				{heroImages.fallback?.url && (
					<section
						className="relative w-full h-[calc(100vh-60px)] lg:h-[calc(100vh-76px)] overflow-hidden flex flex-col #mt-[60px] #lg:mt-[76px]"
					>
						<ResponsivePicture
							imageSet={data?.mainImage}
							title={heroImages.fallback.title || "Offer image"}
							alt={heroImages.fallback.alt || data?.title || "Offer"}
							pictureClassName="absolute inset-0 block w-full h-full"
							imageClassName="w-full h-full object-cover"
						/>
						<div
							className="absolute inset-0 z-[1] pointer-events-none lg:hidden"
							style={{
								background:
									"linear-gradient(to bottom, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 24%)",
							}}
						/>
						<div
							className="absolute inset-0 z-[1] pointer-events-none hidden lg:block"
							style={{
								background:
									"linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 24%)",
							}}
						/>
						<div className="inner-container relative z-[2] flex flex-col items-center justify-end h-full pt-[69px] lg:pt-[64px] pb-[32px]">
							{data?.title && (
								<h1 className="text-center text-white font-futura uppercase tracking-[2.4px] text-[20px] lg:text-[24px] xl:text-4xl leading-[120%] px-4">{data.title}</h1>
							)}
						</div>
					</section>
				)}

				<section
					className="relative overflow-hidden w-full py-8 lg:pb-12 lg:py-16 flex flex-col gap-8 lg:gap-16 items-center justify-center bg-[#F7F4F0]"
				>
					<div className="flex flex-col lg:flex-row gap-0 justify-center items-center w-full max-w-[1153px] h-auto lg:h-[660px] pt-20 overflow-hidden">
						<div className="order-1 lg:order-2 w-full h-[500px] lg:w-1/2 lg:h-full">
							{listingImages.fallback?.url ? (
								<ResponsivePicture
									imageSet={data?.listing_image || data?.listingImage}
									alt={listingImages.fallback.alt || listingTitle}
									pictureClassName="block w-full h-full px-4"
									imageClassName="w-full h-full object-cover"
								/>
							) : (
								<div className="w-full h-full px-4 flex items-center justify-center bg-[#ece6de] text-[#253746]/60">
									No image
								</div>
							)}
						</div>
						<div className="order-2 lg:order-1 h-auto lg:h-full w-full lg:w-1/2 flex flex-col items-start self-stretch gap-8 lg:gap-16 justify-center p-4 lg:p-16">
							<div className="flex flex-col gap-4 lg:gap-6 items-start self-stretch w-full">
								<h2 className="text-[24px] text-secondary font-normal font-glosa leading-[120%] capitalize [leading-trim:both] [text-edge:cap]">
									{listingTitle}
								</h2>
							</div>
							{summary && (
								<div className="flex flex-row gap-2 justify-start w-full">
									<div
										className={clsx(
											"prose [&_p]:leading-[160%] [&_p]:text-[#757575] [&_p]:text-[16px] font-futura max-h-[260px] overflow-y-auto w-full lg:max-w-[400px]",
											"[&_strong]:font-futura [&_strong]:font-[450] [&_strong]:text-[#5C6974]"
										)}
										dangerouslySetInnerHTML={{
											__html: summary,
										}}
									/>
								</div>
							)}
							{(cardLogo?.url || subtitle) && (
								<div className="flex flex-row gap-4 justify-start items-center w-full">
									{cardLogo?.url && (
										<img
											src={cardLogo.url}
											alt={cardLogo.alt || cardLogo.name || "Offer logo"}
											className="h-10 w-auto object-contain"
										/>
									)}
									{subtitle && (
										<h3 className="font-normal text-secondary leading-[100%] uppercase [leading-trim:both] [text-edge:cap] tracking-[2.4px] text-[16px]">
											{subtitle}
										</h3>
									)}
								</div>
							)}
						</div>
					</div>
				</section>

				<section
					className="relative overflow-hidden bg-[#FFF] w-full h-auto flex flex-col items-center max-md:py-16 max-md:px-6 py-16 px-6 min-h-[252px]"
				>
					<div className="w-full lg:max-w-7xl flex flex-col items-center gap-8">
						{offerDetails && (
							<div
								className={clsx(
									"prose w-full max-w-5xl text-sm sm:text-base md:text-lg font-futura font-normal"
								)}
								dangerouslySetInnerHTML={{
									__html: offerDetails,
								}}
							/>
						)}
						<OfferBookingAction
							offerSlug={data?.slug}
							bookingButtonText={bookingButtonText}
							openInNewTab={openInNewTab}
						/>
					</div>
				</section>

				{termsData && <TermsAndConditions data={termsData} />}
			</section>
	);
}

