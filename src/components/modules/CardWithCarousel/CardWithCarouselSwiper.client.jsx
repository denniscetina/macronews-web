"use client";

import { useRef, useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import clsx from "clsx";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import CustomButton from "../../utils/ButtonLink";
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";
import SwiperNavButtons from "./SwiperButtons";

export default function CardWithCarouselSwiper({
	mediaItems = [],
	isVideo = false,
	labels = {},
}) {
	const ref = useRef(null);
	const [activeSlideIndex, setActiveSlideIndex] = useState(0);

	if (!mediaItems.length) {
		return null;
	}

	return (
		<div className="bg bg-white border border-gray-200 shadow-2xl relative h-auto min-h-[300px] lg:h-[560px] w-full max-w-[350px] lg:max-w-[1100px] mx-auto">
			<Swiper
				ref={ref}
				spaceBetween={150}
				slidesPerView={1}
				loop={true}
				className="h-full cursor-grab"
				autoHeight={false}
				onSwiper={(swiper) => setActiveSlideIndex(swiper.realIndex ?? 0)}
				onSlideChange={(swiper) => setActiveSlideIndex(swiper.realIndex ?? 0)}
			>
				{mediaItems.map((item, index) => {
					if (isVideo) {
						const videoUrl = item?.video?.url;
						const isActiveVideo = index === activeSlideIndex;

						return (
							<SwiperSlide
								key={`swipper-slider-video-${index}`}
								className="h-full"
							>
								<div className="w-full h-full">
									{isActiveVideo && videoUrl ? (
										<video
											className="w-full h-[280px] lg:h-[560px] object-cover"
											controls={false}
											autoPlay
											muted
											loop
											playsInline
											preload="none"
										>
											<source src={videoUrl} type="video/mp4" />
											{labels.videoFallback}
										</video>
									) : (
										<div
											className="w-full h-[280px] lg:h-[560px] bg-alt"
											aria-hidden="true"
										/>
									)}
								</div>
							</SwiperSlide>
						);
					}

					const descriptionItem = sanitizeHtml(item.descriptionItem);

					return (
						<SwiperSlide key={`swipper-slider-img-${index}`} className="h-full">
							<div className="flex flex-col lg:flex-row gap-0 items-center h-full">
								<div className={clsx("w-full lg:w-1/2 relative flex h-[275px] lg:h-[560px] order-1",
									item?.imagePosition === "left" ? "lg:order-1" : "lg:order-2"
								)}>
									{item.image && (
										<Image
											src={item.image.url}
											alt={item.image.alt || item.itemTitle || ""}
											fill
											sizes="(max-width: 1024px) 350px, 550px"
											loading={index === 0 ? "eager" : "lazy"}
											fetchPriority={index === 0 ? "high" : "low"}
											className="object-cover"
										/>
									)}
								</div>

								<div className={clsx("w-full lg:w-1/2 flex flex-col justify-center items-start gap-6 p-8 lg:p-16 order-2",
								item.imagePosition === "right" ? "lg:order-2" : "lg:order-1 ")}>
									{item.itemTitle && (
										<h4 className="text-xl md:text-2xl break-all text-secondary font-glosa leading-[120%] capitalize [leading-trim:both] [text-edge:cap]">
											{item.itemTitle}
										</h4>
									)}
									{item.subtitleItem && (
										<p className=" font-futura text-base font-normal leading-[100%] tracking-[2.4px] uppercase [leading-trim:both] [text-edge:cap]">
											{item.subtitleItem}
										</p>
									)}
									{item.descriptionItem && (
										<div
											className={clsx(
												"prose #container-description-card-swiper",
												"prose-p:text-[18px] prose-p:leading-[160%] prose-p:[leading-trim:both] prose-p:[text-edge:cap] prose-p:text-[#757575]",
												"prose-ul:list-disc prose-ul:list-inside prose-ul:my-1 prose-ul:space-y-1 prose-ul:[leading-trim:both] prose-ul:[text-edge:cap]",
												"prose-li:leading-[160%] prose-li:[leading-trim:both] prose-li:[text-edge:cap] prose-li:pl-2 prose-li:text-[#757575]",
												"prose-strong:font-futura prose-strong:font-[450] prose-strong:leading-[160%] prose-strong:text-[#5C6974]"
											)}
											dangerouslySetInnerHTML={{
												__html: descriptionItem,
											}}
										/>
									)}

									{item.buttonSecondary && (
										<CustomButton config={item.buttonSecondary} />
									)}

									{item.primaryButton && (
										<CustomButton
											config={item.primaryButton}
											useMotion={true}
											styleType="outlined"
										/>
									)}
								</div>
							</div>
						</SwiperSlide>
					);
				})}
			</Swiper>
			<SwiperNavButtons instance={ref} labels={labels} />
		</div>
	);
}

CardWithCarouselSwiper.propTypes = {
	mediaItems: PropTypes.array,
	isVideo: PropTypes.bool,
	labels: PropTypes.object,
};
