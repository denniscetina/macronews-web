"use client";

// propTypes
import PropTypes from "prop-types";
import Image from "next/image";
import dynamic from "next/dynamic";
// assets
import CustomButton from "../../utils/ButtonLink";
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";
import { createTranslator } from "@/lib/i18n/translator";

const CardWithCarouselSwiper = dynamic(
	() => import("./CardWithCarouselSwiper.client"),
	{
		loading: () => null,
	},
);

CardWithCarousel.propTypes = {
	data: PropTypes.object,
	dict: PropTypes.object,
};
export default function CardWithCarousel({ data, dict = {} }) {
	const t = createTranslator(dict);

	const {
		title,
		logo,
		description,
		carouselItems,
		mainButton,
		carouselVideo,
		isVideo = false,
		backgroundColor,
	} = data;

	const mediaItems = isVideo && carouselVideo ? carouselVideo : carouselItems;

	const description_ = sanitizeHtml(description);
	const labels = {
		videoFallback: t(
			"CardWithCarousel.msg_browser_does_not_support_video_element",
			"Your browser does not support the video element.",
		),
		previousSlide: t("SwiperButtons.lbl_previous_slide", "Previous slide"),
		nextSlide: t("SwiperButtons.lbl_next_slide", "Next slide"),
	};

	const background =
		backgroundColor === "bg-primary"
			? "#F7F4F0"
			: backgroundColor === "bg-secondary"
				? "#EDE6DE"
				: "#F7F4F0";

	return (
		<section
			data-component="CardWithCarousel"
			className={`bg py-20 flex flex-col items-start w-full max-w-[1920px] mx-auto relative`}
			style={{ background }}
		>
			<div className="container flex flex-col items-center gap-8 mx-auto px-4 md:px-8 max-w-6xl">
				<div className="flex flex-col items-center gap-3.5 text-center">
					{logo && (
						<div className="relative h-16 w-40">
							<Image
								src={logo.url}
								alt={logo.alt || title || ""}
								fill
								sizes="160px"
								className="object-contain"
							/>
						</div>
					)}

					{title && (
						<h4 className="font-normal text-2xl md:text-3xl text-secondary uppercase font-futura [leading-trim:both] leading-[100%] tracking-[2.4px] [text-edge:cap]">
							{title}
						</h4>
					)}
				</div>
				{description && (
					<div
						className="wysiwyg text-lg text-center max-w-3xl mx-auto font-futura body-medium leading-[160%] [leading-trim:both] [text-edge:cap]"
						dangerouslySetInnerHTML={{ __html: description_ }}
					/>
				)}

				{mainButton && !isVideo && (
					<div className="flex justify-center $mt-8 btn-experience">
						<CustomButton config={mainButton} useMotion={true} />
					</div>
				)}

				{mediaItems && mediaItems.length > 0 && (
					<CardWithCarouselSwiper
						mediaItems={mediaItems}
						isVideo={isVideo}
						labels={labels}
					/>
				)}
				{
					/*
					{mainButton && !isVideo && (
					<div className="flex justify-center mt-8 btn-experience">
						<CustomButton config={mainButton} useMotion={true} />
					</div>
				)}
					 */
				}
			</div>
		</section>
	);
}
