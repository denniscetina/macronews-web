import chevronDown from "@/assets/img/chevron-down.svg";
import View360Icon from "@/components/icons/View360";
import Image from "next/image";
import Hero from "@/components/modules/Hero";
import Gallery from "./Gallery";
import clsx from "clsx";
import { createTranslator } from "@/lib/i18n/translator";
import RoomBookingAction from "./RoomBookingAction.client";

function getFirstValidImage(images = []) {
	return images.find((image) => image && typeof image === "object" && image.url) ?? null;
}

function resolveRoomImages(imageSet) {
	if (!imageSet || typeof imageSet !== "object") {
		return {
			desktopImage: null,
			tabletImage: null,
			mobileImage: null,
			fallbackImage: null,
		};
	}

	const directImage = imageSet?.url ? imageSet : null;
	const desktopImage = imageSet.desktopImage || imageSet.desktop || directImage;
	const tabletImage = imageSet.tabletImage || imageSet.tablet || desktopImage;
	const mobileImage = imageSet.mobileImage || imageSet.mobile || tabletImage;
	const fallbackImage = desktopImage || tabletImage || mobileImage;

	return {
		desktopImage: desktopImage || fallbackImage,
		tabletImage: tabletImage || fallbackImage,
		mobileImage: mobileImage || fallbackImage,
		fallbackImage,
	};
}

function normalizeGallery(images = []) {
	if (!Array.isArray(images)) {
		return [];
	}

	return images
		.filter((image) => image && image.url)
		.map((image, index) => ({
			...image,
			id: image.id ?? image.ID ?? `room-gallery-${index}`,
		}));
}

function getActiveItems(items = []) {
	if (!Array.isArray(items)) {
		return [];
	}

	return items.filter((item) => item?.active !== false);
}

const getPriceLabel = (price) => {
	if (!price || typeof price !== "object") {
		return "";
	}

	const prefix = typeof price.prefix === "string" ? price.prefix.trim() : "";
	const suffix = typeof price.suffix === "string" ? price.suffix.trim() : "";
	const amount = parseFloat(price?.amount);
	const hasAmount = typeof amount === "number" && Number.isFinite(amount);
	const amountLabel = hasAmount
		? new Intl.NumberFormat("en-US", {
			maximumFractionDigits: 0,
		}).format(amount)
		: "";

	return [prefix, amountLabel, suffix].filter(Boolean).join(" ");
};

function AmenitiesAccordion({ title, content, toggleLabel }) {
	return (
		<div className="w-full max-w-7xl">
			<details className="group/details">
				<summary
					aria-label={toggleLabel}
					className="flex w-full items-center justify-between pb-3 mb-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden"
				>
					<span className="font-futura font-normal leading-5 text-[20px] text-secondary uppercase tracking-[2.4px] text-center">
						{title}
					</span>
					<span className="transition-transform duration-300 ease-in-out group-open/details:rotate-180">
						<Image
							src={chevronDown}
							alt=""
							aria-hidden
							className="text-secondary h-5 w-5 object-contain"
						/>
					</span>
				</summary>
				<div
					className={clsx(
						"wysiwyg",
						"amenities-content",
						"columns-4 gap-12 [column-fill:balance] max-[1200px]:columns-3 max-[900px]:columns-2 max-[600px]:columns-1",
						"[&_p]:font-futura [&_p]:font-normal [&_p]:text-[16px] [&_p]:leading-4 [&_p]:tracking-[2.4px] [&_p]:uppercase [&_p]:text-[#5C6974] [&_p]:break-after-avoid [&_p]:mb-2",
						"[&_ul]:break-before-avoid [&_ul]:break-inside-auto [&_ul]:list-inside [&_ul]:pl-px",
						"[&_li]:font-futura [&_li]:text-[20px] [&_li]:font-normal [&_li]:leading-8 [&_li]:text-[#5C6974] [&_li]:break-inside-auto  [&_li]:pl-6 [&_li]:list-disc"
					)}
					dangerouslySetInnerHTML={{ __html: content || "" }}
				/>
			</details>
		</div>
	);
}

export default function RoomTemplate({ data, dict = {} }) {
	const t = createTranslator(dict);
	const roomTitle = data?.title || "Room";
	const roomDescription = data?.description || data?.summary || "";
	const virtualTourLink = data?.virtualTourLink;
	const amenitiesSectionTitle = data?.amenitiesSectionTitle || "Top Amenities";
	const {
		desktopImage,
		tabletImage,
		mobileImage,
		fallbackImage: mainImage,
	} = resolveRoomImages(data?.mainImage);
	const heroFallbackImage = {
		url: "",
		alt: roomTitle,
		title: roomTitle,
	};
	const heroData = {
		title: roomTitle,
		backgroundImage: {
			desktopImage: desktopImage || heroFallbackImage,
			tabletImage: tabletImage || desktopImage || heroFallbackImage,
			mobileImage: mobileImage || tabletImage || desktopImage || heroFallbackImage,
		},
	};
	const normalizedGallery = normalizeGallery(data?.gallery);
	const fallbackGalleryImage = getFirstValidImage([mainImage]);
	const galleryImages =
		normalizedGallery.length > 0
			? normalizedGallery
			: fallbackGalleryImage
				? [
						{
							...fallbackGalleryImage,
							id: fallbackGalleryImage.id ?? fallbackGalleryImage.ID ?? "room-main-image",
						},
					]
				: [];

	const priceLabel = getPriceLabel(data?.price);
	const specifications = getActiveItems(data?.specifications);
	const amenities = getActiveItems(data?.amenities);
	const otherAmenities = data?.otherAmenities || "";
	const labels = {
		toggleAmenities: t("RoomTemplate.btn_toggle_amenities", "Toggle amenities"),
		bookNow: t("RoomTemplate.btn_book_now", "Book Now"),
		allAmenities: t("RoomTemplate.lbl_all_amenities", "All Amenities"),
		closeGalleryPreview: t("Gallery.btn_close_gallery_preview", "Close gallery preview"),
	};

	return (
		<section data-component="RoomTemplate">
			<Hero data={heroData} />
			<div className="h-8 md:h-16 w-full bg-alt"></div>
			<section className="relative overflow-hidden bg-[#FDFCFC] w-full py-16 flex justify-center items-center gap-8">
				<div className="flex flex-col max-w-[980px] px-4 w-full justify-center gap-8">
					<div className="flex justify-center gap-2 w-full flex-col sm:items-center lg:flex-row">
						{priceLabel && (
							<div className="flex flex-col py-3 px-6 justify-center items-center bg-[#F7F4F0] font-futura font-normal text-secondary leading-5 tracking-[2.4px] uppercase text-center">
								{priceLabel}
							</div>
						)}

						<RoomBookingAction roomSlug={data?.slug} label={labels.bookNow} />
					</div>

					{roomDescription && (
						<div
							className="wysiwyg w-full pt-4 text-center !text-[#5C6974] !text-[20px] !leading-8"
							dangerouslySetInnerHTML={{ __html: roomDescription }}
						/>
					)}

					{specifications.length > 0 && (
						<div className="flex justify-center gap-2 items-center content-center self-stretch flex-wrap">
							{specifications.map((item, index) => (
								<div
									key={`${item?.label || "spec"}-${index}`}
									className="flex px-3 py-2 justify-center items-center content-center gap-3 flex-wrap"
								>
									{item?.icon?.url && (
										<img
											src={item.icon.url}
											alt={item.icon.alt || item.label || "spec icon"}
											className="w-4 h-4"
										/>
									)}
									<div className="font-futura font-normal text-secondary text-[16px] leading-4 tracking-[2.4px] uppercase text-center">
										{item?.label}
										{item?.value ? ` ${item.value}` : ""}
									</div>
								</div>
							))}
						</div>
					)}

					{virtualTourLink && (
						<a
							href={virtualTourLink}
							target="_blank"
							rel="noopener noreferrer"
							className="bg-contain w-[90px] h-auto m-auto cursor-pointer"
						>
							<View360Icon size={90} />
						</a>
					)}
				</div>
			</section>

			{galleryImages.length > 0 && (
				<section className="relative overflow-hidden bg-[#FDFCFC] w-full py-8 md:py-16 md:pt-0 px-6 flex justify-center items-center gap-8">
					<Gallery images={galleryImages} labels={labels} />
				</section>
			)}

			{ (amenities.length > 0 || otherAmenities) && (
				<section className="relative overflow-hidden w-full py-16 px-6 flex justify-center items-center gap-8">
					<div className="flex flex-col items-center gap-10 self-stretch">
						<div className="text-secondary text-center font-futura font-normal text-[20px] leading-5 tracking-[2.4px] uppercase">
							{amenitiesSectionTitle}
						</div>
						<div className="flex flex-col items-center gap-10 self-stretch">
							{amenities.length > 0 && (
								<div className="flex justify-center items-center gap-16 content-center $self-stretch flex-wrap lg:max-w-[1250px]">
									{amenities.map((item, index) => (
										<div
											key={`${item?.label || "amenity"}-${index}`}
											className="flex py-1.5 px-2 flex-col justify-between items-center self-stretch"
										>
											{item?.icon?.url && (
												<img
													src={item.icon.url}
													alt={item.icon.alt || item.label || "amenity icon"}
													className="pb-6"
												/>
											)}
											<div className="text-secondary font-futura font-normal text-[16px] leading-4 tracking-[2.4px] uppercase text-center">
												{item?.label}
											</div>
										</div>
									))}
								</div>
							)}
							{otherAmenities && (
								<>
									<div className="border-b border-[#929BA2] w-full pt-6" />
									<AmenitiesAccordion
										title={labels.allAmenities}
										content={otherAmenities}
										toggleLabel={labels.toggleAmenities}
									/>
								</>
							)}
						</div>
					</div>
				</section>
			)}
		</section>
	);
}
