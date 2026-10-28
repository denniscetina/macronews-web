"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SiteLink from "@/components/ui/SiteLink";

const SWIPE_DISTANCE = 40;

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
			<Image src={desktop.url} alt={desktop.alt} fill priority={priority} sizes="(min-width: 1280px) 600px, 50vw" className="hidden object-cover md:block" />
		</>
	);
}

function ArrowButton({ direction, label, onClick, side }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className={`absolute top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex ${side}`}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2">
				<path d={direction === "prev" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		</button>
	);
}

/**
 * Slides of the hero carousel: autoplay (stops on hover/focus and with prefers-reduced-motion),
 * arrows, position bars and swipe. All slides stay in the DOM stacked in one grid cell so the height never jumps.
 */
export default function Slides({ slides, dark, navigation, playback, labels }) {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(false);
	const touchStart = useRef(null);
	const count = slides.length;

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReducedMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	useEffect(() => {
		if (!playback.autoplay || count < 2 || paused || reducedMotion) {
			return undefined;
		}
		const timer = setInterval(() => setIndex((current) => (current + 1) % count), playback.autoplayInterval);
		return () => clearInterval(timer);
	}, [playback.autoplay, playback.autoplayInterval, count, paused, reducedMotion]);

	const go = (next) => setIndex((next + count) % count);
	const onTouchEnd = (event) => {
		if (touchStart.current === null) {
			return;
		}
		const distance = event.changedTouches[0].clientX - touchStart.current;
		touchStart.current = null;
		if (Math.abs(distance) > SWIPE_DISTANCE) {
			go(index + (distance < 0 ? 1 : -1));
		}
	};

	const kickerClass = dark ? "bg-accent text-ink" : "bg-primary text-white";
	const buttonClass = dark ? "bg-accent text-ink hover:bg-white" : "bg-primary text-white hover:bg-burgundy";

	return (
		<div
			className="relative"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
			onTouchStart={playback.touchEnabled ? (event) => (touchStart.current = event.touches[0].clientX) : undefined}
			onTouchEnd={playback.touchEnabled ? onTouchEnd : undefined}
		>
			<div className="grid grid-cols-1" aria-live={playback.autoplay && !paused ? "off" : "polite"}>
				{slides.map((slide, slideIndex) => {
					const active = slideIndex === index;
					return (
						<article
							key={slideIndex}
							aria-roledescription="slide"
							aria-label={`${slideIndex + 1} / ${count}`}
							aria-hidden={!active}
							inert={!active}
							className={`col-start-1 row-start-1 grid grid-cols-1 items-center gap-6 transition-opacity duration-500 md:grid-cols-2 md:gap-10 ${active ? "opacity-100" : "pointer-events-none opacity-0"}`}
						>
							<div className="order-2 flex flex-col items-start gap-4 md:order-1 md:px-8">
								{slide.kicker ? (
									<div className="flex items-center gap-3">
										<span className={`px-2 py-1 text-[10px] font-bold uppercase leading-none ${kickerClass}`}>{slide.kicker}</span>
										<span aria-hidden="true" className={`hidden h-px w-8 sm:block ${dark ? "bg-accent" : "bg-primary"}`} />
									</div>
								) : null}
								<h2 className="font-display text-3xl font-extrabold uppercase leading-[1.05] text-balance md:text-[2.75rem]">{slide.title}</h2>
								{slide.description ? <p className={`max-w-md text-sm leading-relaxed ${dark ? "text-white/90" : "text-muted"}`}>{slide.description}</p> : null}
								{slide.cta ? (
									<SiteLink
										href={slide.cta.href}
										external={slide.cta.external}
										target={slide.cta.target ?? undefined}
										className={`inline-block px-5 py-3 text-xs font-bold uppercase tracking-wide transition ${buttonClass}`}
									>
										{slide.cta.label || "Ver noticia"}
									</SiteLink>
								) : null}
							</div>
							<div className="relative order-1 aspect-video overflow-hidden rounded-xl shadow-2xl md:order-2">
								<SlideImage image={slide.image} priority={slideIndex === 0} />
							</div>
						</article>
					);
				})}
			</div>

			{navigation.showPagination && count > 1 ? (
				<div className="mt-6 flex gap-2 md:px-8">
					{slides.map((_, slideIndex) => (
						<button
							key={slideIndex}
							type="button"
							onClick={() => go(slideIndex)}
							aria-label={labels.goTo.replace("{n}", String(slideIndex + 1))}
							aria-current={slideIndex === index}
							className="group py-2"
						>
							<span className={`block h-0.5 w-5 transition ${slideIndex === index ? (dark ? "bg-accent" : "bg-primary") : dark ? "bg-white/40 group-hover:bg-white" : "bg-ink/30 group-hover:bg-ink"}`} />
						</button>
					))}
				</div>
			) : null}

			{navigation.showArrows && count > 1 ? (
				<>
					<ArrowButton direction="prev" label={labels.previous} onClick={() => go(index - 1)} side="-left-4 xl:-left-10" />
					<ArrowButton direction="next" label={labels.next} onClick={() => go(index + 1)} side="-right-4 xl:-right-10" />
				</>
			) : null}
		</div>
	);
}
