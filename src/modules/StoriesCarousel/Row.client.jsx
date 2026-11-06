"use client";

import Image from "next/image";
import { useMemo, useSyncExternalStore } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import SiteLink from "@/components/ui/SiteLink";
import { colorVar } from "@/lib/design-tokens";

/** Where the browser remembers the story ids the reader already saw (the core keeps no reader state). */
const SEEN_KEY = "macronews:stories:seen";

const RING = { unseen: "#7f0000", seen: "#d4d4d4", sponsored: "var(--color-yellow)" };

/** Raw JSON of the seen ids ("[]" on the server and when the browser blocks storage). */
function readSeen() {
	try {
		return localStorage.getItem(SEEN_KEY) ?? "[]";
	} catch {
		return "[]";
	}
}

function subscribeSeen(onChange) {
	window.addEventListener("storage", onChange);
	return () => window.removeEventListener("storage", onChange);
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
 * Topic circle (Figma, 96px wide): 84px ring of 2px (unseen #7F0000, seen #D4D4D4, sponsored #FFEE04 even when seen), 2.5px
 * of white and a 75px photo; without a photo, the initials over the topic color (not designed: Inter 700 24px, white).
 * The badge sits over the bottom right of the ring (Inter 700 9/13.5, radius full, 6px sides; "new" red, "popular"
 * yellow) and the name goes below (Inter 700 12/16, uppercase, centered). The "live" badge the core defines is not in the
 * design (no layer says it, hidden or not), so it is not drawn until design defines it.
 */
function Topic({ topic, seen, labels, dark }) {
	const ring = topic.sponsored ? RING.sponsored : seen ? RING.seen : RING.unseen;
	const fill = topic.customColor || colorVar(topic.color) || "var(--color-primary)";
	const badge = topic.badge === "new" || topic.badge === "popular" ? topic.badge : null;
	return (
		<SiteLink
			href={topic.url}
			aria-label={labels.open.replace("{name}", topic.name)}
			className="group flex min-h-[119px] w-24 flex-col items-center"
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
		</SiteLink>
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
	const isSeen = (topic) => topic.storyIds.length > 0 && topic.storyIds.every((id) => seen.has(id));
	return (
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
							<Topic topic={topic} seen={isSeen(topic)} labels={labels} dark={dark} />
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
	);
}
