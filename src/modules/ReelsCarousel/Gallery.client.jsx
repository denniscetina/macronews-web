"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import SiteLink from "@/components/ui/SiteLink";
import { isToday, timeAgo } from "@/lib/relative-time";

/** Ask for more reels when this many (or fewer) are left after the one on screen. */
const PREFETCH_AT = 2;

/** YouTube / Vimeo embed with the player options that allow an automatic, muted start. */
function embedSrc(video) {
	try {
		const url = new URL(video.embedUrl);
		const options = video.provider === "vimeo" ? { autoplay: "1", muted: "1", playsinline: "1" } : { autoplay: "1", mute: "1", playsinline: "1", rel: "0" };
		for (const [key, value] of Object.entries(options)) {
			url.searchParams.set(key, value);
		}
		return url.toString();
	} catch {
		return null;
	}
}

/**
 * One reel of the gallery: the video (own MP4 with the browser controls, or a YouTube/Vimeo player) in a 9:16 box, and
 * over its bottom the category, the title, the date, the caption and the "Leer la nota" button when the reel has a
 * related post. Only the active reel plays: the others pause and go back to the start.
 */
function ReelSlide({ reel, active, settings, onEnded, labels, newsLabels, lang }) {
	const videoRef = useRef(null);
	const { video, poster } = reel;
	useEffect(() => {
		const element = videoRef.current;
		if (!element) {
			return;
		}
		if (active && settings.autoplay) {
			element.muted = settings.startMuted;
			// The browser may refuse sound before a tap: fall back to muted instead of staying stopped.
			element.play().catch(() => {
				element.muted = true;
				element.play().catch(() => {});
			});
		} else {
			element.pause();
			element.currentTime = 0;
		}
	}, [active, settings.autoplay, settings.startMuted]);

	const embed = video.src ? null : embedSrc(video);
	const ago = isToday(reel.publishedAt) ? labels.today : timeAgo(reel.publishedAt, newsLabels.ago, lang);
	return (
		<div className="relative mx-auto aspect-[9/16] h-full max-h-full max-w-full overflow-hidden bg-black">
			{video.src ? (
				<video
					ref={videoRef}
					src={active ? video.src : undefined}
					poster={poster.url}
					playsInline
					controls
					preload={active ? "auto" : "none"}
					loop={settings.onEnd === "loop"}
					onEnded={settings.onEnd === "next" ? onEnded : undefined}
					className="absolute inset-0 size-full object-contain"
				/>
			) : active && embed ? (
				<iframe src={embed} title={reel.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen className="absolute inset-0 size-full border-0" />
			) : (
				<Image src={poster.url} alt="" fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
			)}
			<div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-16 pt-24">
				{reel.kicker ? (
					<span className="mb-2 inline-block rounded-full bg-black/75 px-2 py-0.5 text-[9px]/[13.5px] font-bold uppercase text-white backdrop-blur-[4px]">{reel.kicker}</span>
				) : null}
				<h2 className="text-lg/6 font-bold text-white">{reel.title}</h2>
				{ago ? <p className="mt-1 text-[10px]/[15px] text-gray">{ago}</p> : null}
				{reel.caption ? <p className="mt-2 line-clamp-3 text-sm/5 text-[#e2e2e4]">{reel.caption}</p> : null}
				{reel.relatedPost ? (
					<SiteLink
						href={reel.relatedPost.url}
						className="pointer-events-auto mt-3 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm/5 font-bold uppercase text-white transition hover:opacity-90"
					>
						{labels.readNote}
					</SiteLink>
				) : null}
			</div>
		</div>
	);
}

/**
 * Reel Mode: the reels in a full screen gallery (Radix Dialog from shadcn/ui) over the page. Splide moves between
 * reels (arrows, swipe, keyboard); at the end of the loaded ones it asks `/api/reels` for more with the carousel's own
 * filters (`feed`) when the CMS allows it (`settings.continueWithLatest`). There is no page per reel: the address does not change.
 * @param {{
 *   items: any[], startIndex: number, feed: { params: Record<string, any> } | null,
 *   settings: { autoplay: boolean, startMuted: boolean, onEnd: "next" | "loop", continueWithLatest: boolean },
 *   labels: Record<string, string>, newsLabels: any, carouselLabels: any, lang: string, onClose: () => void,
 * }} props
 */
export default function Gallery({ items, startIndex, feed, settings, labels, newsLabels, carouselLabels, lang, onClose }) {
	const [reels, setReels] = useState(items);
	const [current, setCurrent] = useState(startIndex);
	const splideRef = useRef(null);
	const reelsRef = useRef(items);
	const cursorRef = useRef(null);
	const loadingRef = useRef(false);
	const doneRef = useRef(!(feed && settings.continueWithLatest));

	const loadMore = useCallback(async () => {
		if (doneRef.current || loadingRef.current) {
			return;
		}
		loadingRef.current = true;
		try {
			const query = new URLSearchParams();
			for (const [key, value] of Object.entries(feed.params ?? {})) {
				if (Array.isArray(value) ? value.length : value !== null && value !== undefined && value !== false && value !== "") {
					query.set(key, Array.isArray(value) ? value.join(",") : value === true ? "1" : String(value));
				}
			}
			query.set("exclude", reelsRef.current.map((reel) => reel.id).join(","));
			if (cursorRef.current) {
				query.set("cursor", cursorRef.current);
			}
			const response = await fetch(`/api/reels?${query.toString()}`);
			const data = response.ok ? await response.json() : { items: [], nextCursor: null };
			const known = new Set(reelsRef.current.map((reel) => reel.id));
			const fresh = (data.items ?? []).filter((reel) => !known.has(reel.id));
			cursorRef.current = data.nextCursor ?? null;
			if (fresh.length === 0 || !cursorRef.current) {
				doneRef.current = true;
			}
			if (fresh.length > 0) {
				reelsRef.current = [...reelsRef.current, ...fresh];
				setReels(reelsRef.current);
			}
		} catch {
			doneRef.current = true;
		} finally {
			loadingRef.current = false;
		}
	}, [feed]);

	// Opening on one of the last reels already needs more.
	useEffect(() => {
		if (startIndex >= items.length - PREFETCH_AT) {
			loadMore();
		}
	}, [startIndex, items.length, loadMore]);

	const goNext = useCallback(async () => {
		const splide = splideRef.current?.splide;
		if (!splide) {
			return;
		}
		if (splide.index >= reelsRef.current.length - 1) {
			await loadMore();
		}
		if (splide.index < reelsRef.current.length - 1) {
			splide.go(">");
		}
	}, [loadMore]);

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="inset-0 bg-black text-white" aria-describedby={undefined}>
				<DialogTitle className="sr-only">{labels.gallery}</DialogTitle>
				<DialogClose
					aria-label={labels.close}
					className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black"
				>
					<svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
						<path d="M6 6l12 12M18 6 6 18" />
					</svg>
				</DialogClose>
				<Splide
					ref={splideRef}
					hasTrack={false}
					className="reel-splide h-full"
					onMoved={(splide, index) => {
						setCurrent(index);
						if (index >= reelsRef.current.length - PREFETCH_AT) {
							loadMore();
						}
					}}
					options={{
						type: "slide",
						start: startIndex,
						perPage: 1,
						gap: 0,
						arrows: true,
						pagination: false,
						drag: true,
						keyboard: "global",
						speed: 400,
						label: labels.gallery,
						reducedMotion: { speed: 0, rewindSpeed: 0 },
						i18n: { prev: carouselLabels.previous, next: carouselLabels.next, first: carouselLabels.first, last: carouselLabels.last, slideX: carouselLabels.goTo.replace("{n}", "%s"), slideLabel: carouselLabels.slideLabel },
					}}
				>
					<div className="relative h-full">
						<SplideTrack>
							{reels.map((reel, index) => (
								<SplideSlide key={reel.id}>
									<ReelSlide reel={reel} active={index === current} settings={settings} onEnded={goNext} labels={labels} newsLabels={newsLabels} lang={lang} />
								</SplideSlide>
							))}
						</SplideTrack>
						<div className="splide__arrows">
							<button type="button" className="splide__arrow splide__arrow--prev">
								<svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5 fill-none stroke-current" strokeWidth="1.17">
									<path d="M8.75 2.92 4.67 7l4.08 4.08" />
								</svg>
							</button>
							<button type="button" className="splide__arrow splide__arrow--next">
								<svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5 fill-none stroke-current" strokeWidth="1.17">
									<path d="M5.25 2.92 9.33 7l-4.08 4.08" />
								</svg>
							</button>
						</div>
					</div>
				</Splide>
			</DialogContent>
		</Dialog>
	);
}
