"use client";

import { useEffect, useRef, useState } from "react";
import SiteLink from "@/components/ui/SiteLink";

// Figma uses Inter 600 for the bar text, which is what the editor's "bold" maps to.
const WEIGHT = { bold: "font-semibold", regular: "font-normal", light: "font-light" };

/*
 * Button variants. PENDING with design / dev-01 (see README "Próximo"): the core and the CMS only name the five
 * variants and Figma only has one Button style (Primary), so:
 * - `primary`: the design system Button (Figma 2.2 Componentes, Size=Normal): #882003 -> #5A1400 on hover, radius 8,
 *   Montserrat 500 14/24, 32px high.
 * - `default` and `secondary`: the bar's own button from the home frame, "Darkred" #820025, Inter 12/16, radius 4, 30px high.
 * - `outline` and `link`: not in the design, plain interpretations.
 */
const FRAME_BUTTON = "h-[30px] gap-1 rounded px-3 font-sans text-xs/4 font-bold uppercase tracking-[0.6px]";
const BUTTON = {
	default: `${FRAME_BUTTON} bg-burgundy text-white hover:bg-ink`,
	secondary: `${FRAME_BUTTON} bg-burgundy text-white hover:bg-ink`,
	primary: "h-8 gap-2 rounded-lg bg-button px-2 font-display text-sm/6 font-medium tracking-[-0.18px] text-white duration-300 ease-out hover:bg-button-hover",
	outline: `${FRAME_BUTTON} border border-current hover:bg-white/15`,
	link: `${FRAME_BUTTON} underline underline-offset-2 hover:no-underline`,
};

/** Is `now` inside the window? Missing bounds are open. */
function isActive({ startAt, endAt }, now) {
	const start = startAt ? Date.parse(startAt) : Number.NEGATIVE_INFINITY;
	const end = endAt ? Date.parse(endAt) : Number.POSITIVE_INFINITY;
	return now >= start && now <= end;
}

function Item({ item, buttonClass }) {
	return (
		<div className="flex min-w-0 items-center justify-between gap-4">
			<p className="truncate text-sm/5 uppercase tracking-[0.35px]">{item.text}</p>
			{item.cta ? (
				<SiteLink
					href={item.cta.href}
					external={item.cta.external}
					target={item.cta.target ?? undefined}
					className={`inline-flex shrink-0 items-center transition ${buttonClass}`}
				>
					{item.cta.label || "Ver noticia"}
					<svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-none stroke-current stroke-2">
						<path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</SiteLink>
			) : null}
		</div>
	);
}

/**
 * Three ways to show the items: one at a time sliding horizontally or vertically, or a continuous marquee.
 * With prefers-reduced-motion only the first item is shown, still.
 */
export default function Ticker({ items, schedule, animation, fontWeight, buttonVariant, dark }) {
	const [visible, setVisible] = useState(() => isActive(schedule, Date.now()));
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(false);
	const track = useRef(null);
	const [duration, setDuration] = useState(30);
	const continuous = animation.transition === "marquee";
	const vertical = animation.transition === "slide_vertical";
	const buttonClass = BUTTON[buttonVariant];

	// The server rendered with the time of the cached page: check again in the browser, then every minute.
	useEffect(() => {
		const check = () => setVisible(isActive(schedule, Date.now()));
		const first = setTimeout(check, 0);
		const timer = setInterval(check, 60_000);
		return () => {
			clearTimeout(first);
			clearInterval(timer);
		};
	}, [schedule]);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReducedMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	useEffect(() => {
		if (continuous || items.length < 2 || paused || reducedMotion) {
			return undefined;
		}
		const timer = setInterval(() => setIndex((current) => (current + 1) % items.length), animation.interval);
		return () => clearInterval(timer);
	}, [continuous, items.length, paused, reducedMotion, animation.interval]);

	useEffect(() => {
		if (continuous && track.current) {
			// The track holds the list twice: one full pass is half of its width.
			setDuration(Math.max(5, track.current.scrollWidth / 2 / animation.speed));
		}
	}, [continuous, animation.speed, items]);

	if (!visible) {
		return null;
	}

	const hover = animation.pauseOnHover ? { onMouseEnter: () => setPaused(true), onMouseLeave: () => setPaused(false), onFocus: () => setPaused(true), onBlur: () => setPaused(false) } : {};

	if (continuous && !reducedMotion) {
		return (
			<div className={`flex min-h-[54px] items-center overflow-hidden ${WEIGHT[fontWeight]}`} {...hover}>
				<div
					ref={track}
					className="flex w-max gap-12"
					style={{ animation: `marquee-scroll ${duration}s linear infinite`, animationPlayState: paused ? "paused" : "running" }}
				>
					{[...items, ...items].map((item, itemIndex) => (
						<div key={itemIndex} aria-hidden={itemIndex >= items.length} className="shrink-0">
							<Item item={item} buttonClass={buttonClass} />
						</div>
					))}
				</div>
			</div>
		);
	}

	const stacked = continuous || reducedMotion ? [items[0]] : items;
	return (
		<div className={`container-site flex min-h-[54px] items-center overflow-hidden ${WEIGHT[fontWeight]}`} {...hover}>
			<div className="grid w-full">
				{stacked.map((item, itemIndex) => {
					const active = itemIndex === index;
					const hidden = vertical ? "-translate-y-full opacity-0" : "-translate-x-6 opacity-0";
					return (
						<div
							key={itemIndex}
							aria-hidden={!active}
							inert={!active}
							className={`col-start-1 row-start-1 transition duration-500 ${active ? "translate-x-0 translate-y-0 opacity-100" : `${hidden} pointer-events-none`}`}
						>
							<Item item={item} buttonClass={buttonClass} />
						</div>
					);
				})}
			</div>
		</div>
	);
}
