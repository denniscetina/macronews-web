"use client";

import Image from "next/image";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import SiteLink from "@/components/ui/SiteLink";
import { timeAgo } from "@/lib/relative-time";

/** Figma "Component: Arrow": 32px circle, 14x14 icon with a 4.08x8.17 chevron and a 1.17px white stroke. */
function Chevron({ direction }) {
	return (
		<svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5 fill-none stroke-current" strokeWidth="1.17">
			<path d={direction === "prev" ? "M8.75 2.92 4.67 7l4.08 4.08" : "M5.25 2.92 9.33 7l-4.08 4.08"} />
		</svg>
	);
}

/** 45 -> "0:45", 161 -> "2:41"; null when the reel has no known duration. */
function formatDuration(seconds) {
	if (!seconds) {
		return "";
	}
	return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
}

/**
 * Reel card (Figma "Reel", 286x508.44 = 9:16, radius 16, #171717, two soft shadows): vertical poster under a black
 * gradient (from-black via-black/30 to-transparent), 16px inside. Top: category pill (Inter 700 9/13.5, black at 75% with
 * a 4px blur, radius full) and duration pill (red #C5111A, radius 4). Bottom, 4px apart: a 40px yellow play button, the
 * title (Inter 700 14/20, white) and the date (10/15, #A3A3A3). The duration and the date use Space Grotesk in the
 * design, a font the project does not load: Inter is used (pending with design).
 */
function ReelCard({ item, labels, newsLabels, lang }) {
	const duration = formatDuration(item.video.duration);
	const ago = timeAgo(item.publishedAt, newsLabels.ago, lang);
	return (
		<SiteLink
			href={item.url}
			aria-label={labels.card.replace("{title}", item.title)}
			className="group relative isolate block aspect-[286/508.44] overflow-hidden rounded-2xl bg-[#171717] shadow-[0_4px_6px_-4px_rgb(0_0_0/0.1),0_10px_15px_-3px_rgb(0_0_0/0.1)]"
		>
			<Image
				src={item.poster.url}
				alt=""
				fill
				sizes="(min-width: 1280px) 286px, (min-width: 768px) 33vw, 70vw"
				className="object-cover transition duration-300 ease-out group-hover:scale-105"
			/>
			<div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
			<div className="absolute inset-0 flex flex-col justify-between p-4">
				<div className="flex items-start justify-between gap-2">
					{item.kicker ? (
						<span className="rounded-full bg-black/75 px-2 py-0.5 text-[9px]/[13.5px] font-bold uppercase text-white backdrop-blur-[4px]">{item.kicker}</span>
					) : (
						<span />
					)}
					{duration ? <span className="rounded bg-primary px-1.5 py-0.5 text-[9px]/[13.5px] font-bold text-white">{duration}</span> : null}
				</div>
				<div className="flex flex-col gap-1">
					<span className="flex size-10 items-center justify-center rounded-full bg-accent text-black" aria-hidden="true">
						<svg viewBox="0 0 24 24" className="size-6 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<path d="M7 4.5 19 12 7 19.5z" />
						</svg>
					</span>
					<h3 className="pt-1 text-sm/5 font-bold text-white">{item.title}</h3>
					{ago ? <p className="text-[10px]/[15px] text-gray">{ago}</p> : null}
				</div>
			</div>
		</SiteLink>
	);
}

/**
 * Splide carousel of reel cards: `slidesPerView.desktop` columns from 1280px (4 in the design, 24px apart), 3 and 2 on
 * the way down, `slidesPerView.mobile` (decimals show a piece of the next card) under 768px.
 */
export default function Carousel({ items, slidesPerView, navigation, labels, newsLabels, carouselLabels, lang }) {
	const many = items.length > 1;
	const mobileWidth = `${(100 / slidesPerView.mobile).toFixed(2)}%`;
	return (
		<Splide
			hasTrack={false}
			className="news-splide"
			options={{
				type: "slide",
				perPage: slidesPerView.desktop,
				gap: "1.5rem",
				arrows: navigation.showArrows && many,
				pagination: navigation.showPagination && many,
				speed: 500,
				label: labels.list,
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
			<div className="relative">
				<SplideTrack>
					{items.map((item) => (
						<SplideSlide key={item.id}>
							<ReelCard item={item} labels={labels} newsLabels={newsLabels} lang={lang} />
						</SplideSlide>
					))}
				</SplideTrack>
				{navigation.showArrows && many ? (
					<div className="splide__arrows">
						<button type="button" className="splide__arrow splide__arrow--prev">
							<Chevron direction="prev" />
						</button>
						<button type="button" className="splide__arrow splide__arrow--next">
							<Chevron direction="next" />
						</button>
					</div>
				) : null}
			</div>
		</Splide>
	);
}
