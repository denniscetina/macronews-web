"use client";

import { Splide, SplideSlide } from "@splidejs/react-splide";
import { CompactCard, StoryCard } from "./Cards";

/**
 * Carousel of the `compact` and `cards` variants (Splide). `slidesPerView.desktop` columns from 1280px, 3 and 2 on the
 * way down, and `slidesPerView.mobile` (decimals show a piece of the next slide) under 768px. Gap 24px as in Figma.
 */
export default function Carousel({ items, variant, slidesPerView, navigation, playback, labels, carouselLabels }) {
	const many = items.length > 1;
	const mobileWidth = `${(100 / slidesPerView.mobile).toFixed(2)}%`;
	return (
		<Splide
			className="news-splide"
			options={{
				type: "slide",
				perPage: slidesPerView.desktop,
				gap: "1.5rem",
				arrows: navigation.showArrows && many,
				pagination: navigation.showPagination && many,
				drag: playback.touchEnabled,
				autoplay: playback.autoplay && many,
				interval: playback.autoplayInterval,
				pauseOnHover: playback.pauseOnHover,
				pauseOnFocus: true,
				speed: 500,
				label: carouselLabels.region,
				reducedMotion: { speed: 0, rewindSpeed: 0, autoplay: "pause" },
				breakpoints: {
					1279: { perPage: Math.min(3, slidesPerView.desktop) },
					1023: { perPage: Math.min(2, slidesPerView.desktop) },
					767: { perPage: 1, fixedWidth: mobileWidth, gap: "1rem" },
				},
				i18n: {
					prev: carouselLabels.previous,
					next: carouselLabels.next,
					first: carouselLabels.first,
					last: carouselLabels.last,
					slideX: carouselLabels.goTo.replace("{n}", "%s"),
					pageX: carouselLabels.goTo.replace("{n}", "%s"),
					slideLabel: carouselLabels.slideLabel,
				},
			}}
		>
			{items.map((item) => (
				<SplideSlide key={item.id}>{variant === "cards" ? <StoryCard item={item} labels={labels} /> : <CompactCard item={item} />}</SplideSlide>
			))}
		</Splide>
	);
}
