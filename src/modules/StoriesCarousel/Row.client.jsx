"use client";

import Image from "next/image";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import { colorVar } from "@/lib/design-tokens";
import Viewer from "./Viewer.client";

/** Where the browser remembers the story ids the reader already saw (the core keeps no reader state). */
const SEEN_KEY = "macronews:stories:seen";

const RING = { unseen: "#7f0000", seen: "#d4d4d4", sponsored: "var(--color-yellow)" };

/** Same-tab signal: the `storage` event only fires in the other tabs. */
const SEEN_EVENT = "macronews:stories-seen";
const SEEN_LIMIT = 500;
/** Seen ids kept in memory when the browser blocks storage, so the ring still turns gray during the visit. */
let memorySeen = "[]";

/** Raw JSON of the seen ids ("[]" on the server and when nothing was saved). */
function readSeen() {
	try {
		return localStorage.getItem(SEEN_KEY) ?? memorySeen;
	} catch {
		return memorySeen;
	}
}

function subscribeSeen(onChange) {
	window.addEventListener("storage", onChange);
	window.addEventListener(SEEN_EVENT, onChange);
	return () => {
		window.removeEventListener("storage", onChange);
		window.removeEventListener(SEEN_EVENT, onChange);
	};
}

/** Adds story ids to the seen list (the latest 500) and tells the row to repaint. */
function markSeen(ids) {
	let seen = [];
	try {
		seen = JSON.parse(readSeen());
	} catch {
		seen = [];
	}
	memorySeen = JSON.stringify([...new Set([...seen, ...ids])].slice(-SEEN_LIMIT));
	try {
		localStorage.setItem(SEEN_KEY, memorySeen);
	} catch {
		// Storage blocked: the in-memory copy above is enough for this visit.
	}
	window.dispatchEvent(new Event(SEEN_EVENT));
}

/** Figma "Component: Arrow": 32px circle, 14x14 icon with a 4.08x8.17 chevron and a 1.17px white stroke. */
function Chevron({ direction }) {
	return (
		<svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5 fill-none stroke-current" strokeWidth="1.17">
			<path d={direction === "prev" ? "M8.75 2.92 4.67 7l4.08 4.08" : "M5.25 2.92 9.33 7l-4.08 4.08"} />
		</svg>
	);
}

/**
 * Topic circle (Figma, 96px wide); clicking it opens the Stories Mode and marks the topic as seen (its ring turns gray). 84px ring of 2px (unseen #7F0000, seen #D4D4D4, sponsored #FFEE04 even when seen), 2.5px
 * of white and a 75px photo; without a photo, the initials over the topic color (not designed: Inter 700 24px, white).
 * The badge sits over the bottom right of the ring (Inter 700 9/13.5, radius full, 6px sides; "new" red, "popular"
 * yellow; "live" is defined by the core but not drawn in the Figma: it uses the red one, style pending with design) and
 * the name goes below (Inter 700 12/16, uppercase, centered).
 */
function Topic({ topic, seen, onOpen, labels, dark }) {
	const ring = topic.sponsored ? RING.sponsored : seen ? RING.seen : RING.unseen;
	const fill = topic.customColor || colorVar(topic.color) || "var(--color-primary)";
	const badge = topic.badge;
	return (
		<button
			type="button"
			aria-label={labels.open.replace("{name}", topic.name)}
			aria-haspopup="dialog"
			onClick={() => onOpen(topic)}
			className="group flex min-h-[119px] w-24 cursor-pointer flex-col items-center"
		>
			<span className="relative -mt-0.5 block size-[84px] shrink-0">
				<span className="block size-full rounded-full border-2 p-[2.5px] transition-transform duration-200 ease-out group-hover:scale-[1.03]" style={{ borderColor: ring }}>
					{topic.image ? (
						<Image src={topic.image.url} alt="" width={75} height={75} className="size-full rounded-full object-cover" />
					) : (
						<span className="flex size-full items-center justify-center rounded-full text-2xl/8 font-bold text-white" style={{ backgroundColor: fill }}>
							{topic.initials}
						</span>
					)}
				</span>
				{badge ? (
					<span
						className={`absolute bottom-0.5 right-1.5 rounded-full px-1.5 text-[9px]/[13.5px] font-bold uppercase ${badge === "popular" ? "bg-accent text-[#171717]" : "bg-primary text-white"}`}
					>
						{labels.badge[badge]}
					</span>
				) : null}
			</span>
			<span className={`mt-1.5 block w-[88px] text-center text-xs/4 font-bold uppercase ${dark ? "text-white" : "text-[#171717]"}`}>{topic.label}</span>
		</button>
	);
}

/** Marks the root with `is-overflow` when the topics do not fit in one row (the arrow style hides the arrows otherwise). */
function markOverflow(splide) {
	const { list, track } = splide.Components.Elements;
	splide.root.classList.toggle("is-overflow", list.scrollWidth > track.clientWidth + 1);
}

/**
 * Horizontal row of topics (Splide, 96px items 32px apart, 4px above and 16px below). Arrows show on desktop only when
 * the topics do not fit in one row (`is-overflow`, see `markOverflow`).
 */
export default function Row({ topics, navigation, labels, carouselLabels, dark }) {
	const rawSeen = useSyncExternalStore(subscribeSeen, readSeen, () => "[]");
	const seen = useMemo(() => {
		try {
			return new Set(JSON.parse(rawSeen));
		} catch {
			return new Set();
		}
	}, [rawSeen]);
	const [openTopic, setOpenTopic] = useState(null);
	const isSeen = (topic) => topic.stories.length > 0 && topic.stories.every((story) => seen.has(story.id));
	const open = (topic) => {
		markSeen(topic.stories.map((story) => story.id));
		setOpenTopic(topic);
	};
	return (
		<>
		<Splide
			hasTrack={false}
			className="news-splide stories-splide"
			onMounted={markOverflow}
			onResized={markOverflow}
			options={{
				type: "slide",
				fixedWidth: "6rem",
				gap: "2rem",
				arrows: navigation.showArrows,
				pagination: false,
				drag: "free",
				snap: false,
				speed: 400,
				label: labels.list,
				reducedMotion: { speed: 0, rewindSpeed: 0 },
				i18n: { prev: carouselLabels.previous, next: carouselLabels.next, first: carouselLabels.first, last: carouselLabels.last },
			}}
		>
			<div className="relative">
				<SplideTrack className="pb-4 pt-1">
					{topics.map((topic) => (
						<SplideSlide key={topic.id}>
							<Topic topic={topic} seen={isSeen(topic)} onOpen={open} labels={labels} dark={dark} />
						</SplideSlide>
					))}
				</SplideTrack>
				{navigation.showArrows ? (
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
		{openTopic ? <Viewer topic={openTopic} labels={labels} carouselLabels={carouselLabels} onClose={() => setOpenTopic(null)} /> : null}
		</>
	);
}
