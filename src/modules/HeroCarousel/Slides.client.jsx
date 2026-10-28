"use client";

import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import Image from "next/image";
import SiteLink from "@/components/ui/SiteLink";

/** Slide image: mobile variant under 768px, desktop above (the mobile one falls back to the desktop one). */
function SlideImage({ image, priority }) {
	const desktop = image.desktop ?? image.mobile;
	const mobile = image.mobile ?? desktop;
	if (!desktop) {
		return null;
	}
	return (
		<>
			<Image src={mobile.url} alt={mobile.alt} fill priority={priority} sizes="100vw" className="object-cover md:hidden" />
			<Image src={desktop.url} alt={desktop.alt} fill priority={priority} sizes="(min-width: 1280px) 540px, 50vw" className="hidden object-cover md:block" />
		</>
	);
}

function Chevron({ direction }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2">
			<path d={direction === "prev" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

/**
 * Hero slides with Splide: loop, autoplay (pauses on hover/focus; Splide also stops it with
 * prefers-reduced-motion), drag/swipe, arrows and position bars. Styles: `.hero-splide` in globals.css.
 * Arrows and bars only exist with more than one slide.
 */
export default function Slides({ slides, dark, navigation, playback, labels }) {
	const count = slides.length;
	const many = count > 1;
	const kickerClass = dark ? "bg-accent text-black" : "bg-primary text-white";
	const buttonClass = dark ? "bg-accent text-black hover:bg-white" : "bg-primary text-white hover:bg-burgundy";

	return (
		<Splide
			hasTrack={false}
			className={`hero-splide ${dark ? "hero-splide--dark" : "hero-splide--light"}`}
			options={{
				type: many ? "loop" : "slide",
				arrows: navigation.showArrows && many,
				pagination: navigation.showPagination && many,
				drag: playback.touchEnabled && many,
				autoplay: playback.autoplay && many,
				interval: playback.autoplayInterval,
				pauseOnHover: true,
				pauseOnFocus: true,
				speed: 600,
				reducedMotion: { speed: 0, rewindSpeed: 0, autoplay: "pause" },
				label: labels.region,
				i18n: {
					prev: labels.previous,
					next: labels.next,
					first: labels.first,
					last: labels.last,
					slideX: labels.goTo.replace("{n}", "%s"),
					pageX: labels.goTo.replace("{n}", "%s"),
					slideLabel: labels.slideLabel,
				},
			}}
		>
			<div className="relative">
				<SplideTrack>
					{slides.map((slide, index) => (
						<SplideSlide key={index}>
							<article className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 md:gap-10 lg:grid-cols-[minmax(0,36rem)_minmax(0,33.75rem)] lg:justify-between">
								<div className="order-2 flex flex-col items-start md:order-1">
									{slide.kicker ? (
										<div className="mb-4 flex items-center gap-3">
											<span className={`rounded-[2px] px-3 py-1 text-xs font-black uppercase leading-4 tracking-[0.6px] ${kickerClass}`}>{slide.kicker}</span>
											<span aria-hidden="true" className={`hidden h-0.5 w-12 sm:block ${dark ? "bg-accent" : "bg-primary"}`} />
										</div>
									) : null}
									<h2 className="font-display text-4xl/9 font-black uppercase tracking-[-1.25px] text-balance md:text-[50px]/[50px]">{slide.title}</h2>
									{slide.description ? (
										<p className={`mt-6 max-w-xl text-base/6 ${dark ? "text-[#e5e5e5]" : "text-muted"}`}>{slide.description}</p>
									) : null}
									{slide.cta ? (
										<SiteLink
											href={slide.cta.href}
											external={slide.cta.external}
											target={slide.cta.target ?? undefined}
											className={`mt-8 inline-flex h-10 items-center px-5 text-sm/5 font-black uppercase tracking-[0.7px] transition ${buttonClass}`}
										>
											{slide.cta.label || "Ver noticia"}
										</SiteLink>
									) : null}
								</div>
								<div className="relative order-1 aspect-[3/2] overflow-hidden rounded-xl shadow-2xl md:order-2">
									<SlideImage image={slide.image} priority={index === 0} />
								</div>
							</article>
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
