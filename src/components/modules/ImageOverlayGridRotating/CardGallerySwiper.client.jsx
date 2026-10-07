"use client";

import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import CardImagesRotating from "./CardImagesRotating";
import SwiperNavButtons from "./SwiperNavButtons";

const chunkArray = (array, chunkSize) => {
	const chunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
};

export default function CardGallerySwiper({ cardImages = [], labels }) {
	const ref = useRef(null);
	const cardCount = cardImages.length;
	const chunks = chunkArray(cardImages, 6);
	const totalPages = chunks.length;
	const [currentPage, setCurrentPage] = useState(1);

	if (chunks.length === 0) {
		return null;
	}

	const handleSlideChange = () => {
		const swiper = ref.current?.swiper;
		setCurrentPage((swiper?.realIndex ?? 0) + 1);
	};

	return (
		<>
			<Swiper
				ref={ref}
				loop={true}
				slidesPerView={1}
				spaceBetween={40}
				onSlideChange={handleSlideChange}
				className="max-w-7xl h-full"
			>
				{chunks.map((group, index) => (
					<SwiperSlide className="w-full " key={`group-${index}`}>
						<div className="grid grid-cols-1 md:grid-cols-2 pt-16 pb-8 px-6 gap-10 lg:grid-cols-3 ">
							{group.map((card, idx) => (
								<CardImagesRotating
									key={`card-${index}-${idx}`}
									cardCount={cardCount}
									card={card}
									labels={labels}
								/>
							))}
						</div>
					</SwiperSlide>
				))}
			</Swiper>
			<SwiperNavButtons
				custom={
					<div className="absolute left-[48%] text-sm flex justify-center font-medium mb-4">
						{currentPage} / {totalPages}
					</div>
				}
				buttonStyle="55px"
				instance={ref}
				isMobile={true}
			/>
		</>
	);
}

CardGallerySwiper.propTypes = {
	cardImages: PropTypes.array,
	labels: PropTypes.object,
};
