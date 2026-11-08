"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import SiteLink from "@/components/ui/SiteLink";

/** How long a photo (or a YouTube/Vimeo story, whose player we cannot listen to) stays on screen. Not defined by the core. */
const IMAGE_MS = 5000;
const EMBED_MS = 15000;
/** A press longer than this is a "hold to pause", not a tap to move. */
const HOLD_MS = 250;

/** YouTube / Vimeo embed, muted and playing. */
function embedSrc(video) {
	try {
		const url = new URL(video.embedUrl);
		const options = video.provider === "vimeo" ? { autoplay: "1", muted: "1", playsinline: "1" } : { autoplay: "1", mute: "1", playsinline: "1", rel: "0", controls: "0" };
		for (const [key, value] of Object.entries(options)) {
			url.searchParams.set(key, value);
		}
		return url.toString();
	} catch {
		return null;
	}
}

/** Media of one story: photo, own MP4 (the viewer follows its time) or embedded player; only the active one loads/plays. */
function StoryMedia({ story, active, paused, muted, onProgress, onEnded }) {
	const videoRef = useRef(null);
	const { media } = story;
	const file = media.type === "video" ? media.video?.src : null;
	const embed = media.type === "video" && !file && media.video ? embedSrc(media.video) : null;
	const fit = media.fit === "contain" ? "object-contain" : "object-cover";

	useEffect(() => {
		const element = videoRef.current;
		if (!element) {
			return;
		}
		if (active && !paused) {
			element.play().catch(() => {});
		} else {
			element.pause();
		}
		if (!active) {
			element.currentTime = 0;
		}
	}, [active, paused]);

	if (file) {
		return (
			<video
				ref={videoRef}
				src={active ? file : undefined}
				poster={media.image?.url}
				muted={muted}
				playsInline
				preload={active ? "auto" : "none"}
				onTimeUpdate={(event) => {
					const { currentTime, duration } = event.currentTarget;
					if (active && duration > 0) {
						onProgress(currentTime / duration);
					}
				}}
				onEnded={active ? onEnded : undefined}
				className={`absolute inset-0 size-full ${fit}`}
			/>
		);
	}
	if (active && embed) {
		return <iframe src={embed} title={story.title} allow="autoplay; encrypted-media; picture-in-picture" className="absolute inset-0 size-full border-0" />;
	}
	return media.image ? <Image src={media.image.url} alt="" fill sizes="(min-width: 768px) 400px, 100vw" className={fit} priority={active} /> : <div className="absolute inset-0 bg-ink" />;
}

/** Duration the timer waits for a story; null when the story is an own video (its own time drives the bar). */
function timedDuration(story) {
	const { media } = story;
	if (media.type === "video" && media.video?.src) {
		return null;
	}
	return media.type === "video" ? EMBED_MS : IMAGE_MS;
}

/**
 * Stories Mode (not designed yet, built from the core and dev-01's description): the topic's stories in a full screen
 * Radix Dialog, Instagram style. One story at a time (Splide), a progress bar per story on top, tap the left third to go
 * back and the rest to go forward, hold to pause, arrows keys work too. It advances by itself (5 s a photo, the video's
 * own length for MP4) and closes after the last one. Each story has a "Leer noticia" link to its post.
 * @param {{
 *   topic: { name: string, label: string, stories: any[] },
 *   labels: Record<string, string>, carouselLabels: any, onClose: () => void,
 * }} props
 */
export default function Viewer({ topic, labels, carouselLabels, onClose }) {
	const { stories } = topic;
	const [index, setIndex] = useState(0);
	// Progress belongs to the story it was measured in, so a new story starts at 0 without resetting state in an effect.
	const [measure, setMeasure] = useState({ index: 0, value: 0 });
	const [paused, setPaused] = useState(false);
	const [muted, setMuted] = useState(true);
	const splideRef = useRef(null);
	const indexRef = useRef(0);
	const pausedRef = useRef(false);
	const pressRef = useRef(0);

	const setPause = useCallback((value) => {
		pausedRef.current = value;
		setPaused(value);
	}, []);

	const advance = useCallback(() => {
		if (indexRef.current >= stories.length - 1) {
			onClose();
			return;
		}
		splideRef.current?.splide?.go(indexRef.current + 1);
	}, [stories.length, onClose]);

	const back = useCallback(() => {
		const splide = splideRef.current?.splide;
		if (indexRef.current > 0) {
			splide?.go(indexRef.current - 1);
		} else {
			setMeasure({ index: 0, value: 0 });
		}
	}, []);

	const story = stories[index];
	const duration = timedDuration(story);
	useEffect(() => {
		if (duration === null) {
			return undefined;
		}
		let frame;
		let elapsed = 0;
		let last = performance.now();
		const tick = (now) => {
			if (!pausedRef.current) {
				elapsed += now - last;
			}
			last = now;
			const value = Math.min(elapsed / duration, 1);
			setMeasure({ index, value });
			if (value >= 1) {
				advance();
				return;
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [index, duration, advance]);

	const press = () => {
		pressRef.current = performance.now();
		setPause(true);
	};
	const release = (action) => {
		const held = performance.now() - pressRef.current > HOLD_MS;
		setPause(false);
		if (!held) {
			action();
		}
	};
	const hasVideo = story.media.type === "video" && story.media.video?.src;

	return (
		<Dialog open onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="inset-0 bg-black text-white" aria-describedby={undefined}>
				<DialogTitle className="sr-only">{labels.viewer.replace("{name}", topic.name)}</DialogTitle>
				<div className="relative mx-auto aspect-[9/16] h-full max-h-full max-w-full overflow-hidden bg-black">
					<Splide
						ref={splideRef}
						hasTrack={false}
						className="reel-splide h-full"
						onMove={(splide, next) => {
							indexRef.current = next;
							setIndex(next);
						}}
						options={{
							type: "slide",
							perPage: 1,
							gap: 0,
							arrows: false,
							pagination: false,
							drag: false,
							keyboard: "global",
							speed: 250,
							label: labels.viewer.replace("{name}", topic.name),
							reducedMotion: { speed: 0, rewindSpeed: 0 },
							i18n: { slideX: carouselLabels.goTo.replace("{n}", "%s"), slideLabel: carouselLabels.slideLabel },
						}}
					>
						<SplideTrack>
							{stories.map((item, position) => (
								<SplideSlide key={item.id}>
									<StoryMedia
										story={item}
										active={position === index}
										paused={paused}
										muted={muted}
										onEnded={advance}
										onProgress={(value) => setMeasure({ index: position, value })}
									/>
								</SplideSlide>
							))}
						</SplideTrack>
					</Splide>

					{/* Tap zones: left third goes back, the rest goes forward; a long press only pauses. Out of the tab order: the arrow keys do the same. */}
					<button type="button" tabIndex={-1} aria-label={labels.previous} onPointerDown={press} onPointerUp={() => release(back)} onPointerLeave={() => setPause(false)} className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-pointer outline-none" />
					<button type="button" tabIndex={-1} aria-label={labels.next} onPointerDown={press} onPointerUp={() => release(advance)} onPointerLeave={() => setPause(false)} className="absolute inset-y-0 right-0 z-10 w-2/3 cursor-pointer outline-none" />

					<div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/70 to-transparent px-3 pb-10 pt-3">
						<div className="flex gap-1" role="presentation">
							{stories.map((item, position) => {
								const value = position < index ? 1 : position === index && measure.index === index ? measure.value : 0;
								return (
									<span key={item.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
										<span className="block h-full origin-left bg-white" style={{ transform: `scaleX(${value})` }} />
									</span>
								);
							})}
						</div>
						<p className="mt-3 pr-24 text-xs/4 font-bold uppercase">{topic.label}</p>
					</div>
					<DialogClose
						aria-label={labels.close}
						className="absolute right-3 top-6 z-30 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black"
					>
						<svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
							<path d="M6 6l12 12M18 6 6 18" />
						</svg>
					</DialogClose>
					{hasVideo ? (
						<button
							type="button"
							aria-label={muted ? labels.unmute : labels.mute}
							aria-pressed={!muted}
							onClick={() => setMuted((value) => !value)}
							className="absolute right-14 top-6 z-30 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black"
						>
							<svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M4 9v6h4l5 4V5L8 9H4z" />
								{muted ? <path d="M17 9l4 6M21 9l-4 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7" />}
							</svg>
						</button>
					) : null}

					<div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-8 pt-24">
						{story.kicker ? (
							<span className="mb-2 inline-block rounded-full bg-black/75 px-2 py-0.5 text-[9px]/[13.5px] font-bold uppercase text-white backdrop-blur-[4px]">{story.kicker}</span>
						) : null}
						<h2 className="text-lg/6 font-bold text-white">{story.title}</h2>
						{story.excerpt ? <p className="mt-2 line-clamp-3 text-sm/5 text-[#e2e2e4]">{story.excerpt}</p> : null}
						<SiteLink
							href={story.url}
							onClick={onClose}
							className="pointer-events-auto mt-3 inline-flex h-10 cursor-pointer items-center rounded-lg bg-primary px-4 text-sm/5 font-bold uppercase text-white transition hover:opacity-90"
						>
							{labels.readNews}
						</SiteLink>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
