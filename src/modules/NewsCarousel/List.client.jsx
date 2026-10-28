"use client";

import { useEffect, useState } from "react";
import AdSlot from "@/components/ui/AdSlot";
import SiteLink from "@/components/ui/SiteLink";
import { timeAgo } from "@/lib/relative-time";
import { NewsImage } from "./Cards";

const NOTICE_BUTTON = "shrink-0 rounded-md bg-burgundy px-4 py-2.5 text-xs/4 font-medium uppercase tracking-[0.6px] text-surface transition hover:bg-ink";

function NoticeIcon({ icon }) {
	const common = "size-4 fill-none stroke-current stroke-2";
	return (
		<span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-burgundy text-xs font-bold text-white">
			{icon === "alert" ? "!" : null}
			{icon === "info" ? "i" : null}
			{icon === "megaphone" ? (
				<svg viewBox="0 0 24 24" className={common}>
					<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1Zm14-3a5 5 0 0 1 0 8" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
			) : null}
			{icon === "mail" ? (
				<svg viewBox="0 0 24 24" className={common}>
					<path d="M4 6h16v12H4zM4 7l8 6 8-6" strokeLinejoin="round" />
				</svg>
			) : null}
		</span>
	);
}

/** Banner under the featured news ("Tu voz cuenta..."): Figma "Secondary micro-banner", #F5F5F5, 1px #E5E5E5, radius 12. */
function Notice({ notice }) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-100 p-4">
			<div className="flex min-w-0 items-center gap-4">
				<NoticeIcon icon={notice.icon} />
				<p className="text-sm/6 text-muted">
					{notice.title ? <strong className="block font-bold text-ink">{notice.title}</strong> : null}
					<span className="font-medium">{notice.message}</span>
				</p>
			</div>
			{notice.cta ? (
				<SiteLink href={notice.cta.href} external={notice.cta.external} target={notice.cta.target ?? undefined} className={NOTICE_BUTTON}>
					{notice.cta.label}
				</SiteLink>
			) : null}
		</div>
	);
}

function Skeleton({ label }) {
	return (
		<div role="status" aria-label={label} className="grid animate-pulse gap-6 lg:grid-cols-12">
			<div className="space-y-6 lg:col-span-5">
				{[0, 1, 2, 3].map((i) => (
					<div key={i} className="space-y-3 border-t border-neutral-200 pt-6 first:border-t-0 first:pt-0">
						<div className="h-5 w-4/5 rounded bg-neutral-200" />
						<div className="h-3 w-2/5 rounded bg-neutral-200" />
					</div>
				))}
			</div>
			<div className="aspect-[689/474] rounded-2xl bg-neutral-200 lg:col-span-7" />
		</div>
	);
}

/**
 * `list` variant: titles on the left (5 of 12 columns), the active one featured on the right (7 of 12).
 * The featured news follows the cursor / focus / tap, or rotates by itself when autoplay is on (it stops on hover,
 * focus and prefers-reduced-motion). With `nearby` the items are asked at run time to `/api/news/nearby`, which
 * adds the reader's location: the page itself stays cached and identical for everybody.
 */
export default function List({ items: initialItems, nearby, notice, playback, showAds, labels, lang }) {
	const [items, setItems] = useState(initialItems);
	const [status, setStatus] = useState(nearby ? "loading" : "ready");
	const [active, setActive] = useState(0);
	const [paused, setPaused] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(false);

	useEffect(() => {
		if (!nearby) {
			return undefined;
		}
		const controller = new AbortController();
		const query = new URLSearchParams({ selectionCriteria: nearby.selectionCriteria, postsLimit: String(nearby.postsLimit) });
		if (nearby.categories.length) query.set("categories", nearby.categories.join(","));
		if (nearby.tags.length) query.set("tags", nearby.tags.join(","));
		if (nearby.dateRange) query.set("dateRange", nearby.dateRange);
		if (nearby.lang) query.set("lang", nearby.lang);
		fetch(`/api/news/nearby?${query}`, { signal: controller.signal })
			.then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
			.then((result) => {
				setItems(result.items ?? []);
				setStatus("ready");
			})
			.catch((error) => {
				if (error.name !== "AbortError") setStatus("ready");
			});
		return () => controller.abort();
	}, [nearby]);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReducedMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	useEffect(() => {
		if (!playback.autoplay || items.length < 2 || paused || reducedMotion) {
			return undefined;
		}
		const timer = setInterval(() => setActive((current) => (current + 1) % items.length), playback.autoplayInterval);
		return () => clearInterval(timer);
	}, [playback.autoplay, playback.autoplayInterval, items.length, paused, reducedMotion]);

	if (status === "loading") {
		return <Skeleton label={labels.loading} />;
	}
	if (items.length === 0) {
		return <p className="py-8 text-center text-sm text-muted">{labels.empty}</p>;
	}

	const current = items[Math.min(active, items.length - 1)];
	const ago = (item) => timeAgo(item.publishedAt, labels.ago, lang);

	return (
		<div
			className="grid gap-6 lg:grid-cols-12"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
		>
			<div className="lg:col-span-5">
				<ul>
					{items.map((item, index) => {
						const isActive = index === active;
						// Every item has the SAME box in both states (1px top and bottom lines, 4px left line, 24px above and
						// below, the excerpt always shown): only colors change. If the active item changed the layout, the
						// item under the pointer would move away and the list would flicker between two news on hover.
						// The line above an item is gray, except the first one and the one that follows the active item
						// (the active item draws its own red lines).
						const grayTop = index > 0 && index - 1 !== active;
						return (
							<li key={item.id} className={index === 0 ? "-mt-[25px]" : ""}>
								<SiteLink
									href={item.url}
									aria-current={isActive}
									onMouseEnter={() => setActive(index)}
									onFocus={() => setActive(index)}
									onTouchStart={() => setActive(index)}
									className={`block space-y-1.5 border-y border-l-4 pb-6 pt-6 transition-[color,background-color] duration-150 focus-visible:outline-none ${
										isActive
											? "rounded-r border-burgundy bg-surface/60 pl-4"
											: `-ml-1 border-transparent ${grayTop ? "border-t-neutral-200" : ""}`
									}`}
								>
									<h3 className={`min-h-14 text-lg/7 font-bold ${isActive ? "text-burgundy" : "text-[#171717]"}`}>{item.title}</h3>
									{item.excerpt ? <p className="line-clamp-2 text-sm/5 text-[#525252]">{item.excerpt}</p> : null}
									<p className="flex flex-wrap items-center gap-2 text-xs/4">
										{item.location ? <span className={`font-medium ${isActive ? "text-burgundy" : "text-[#404040]"}`}>{item.location}</span> : null}
										{item.location && item.publishedAt ? <span aria-hidden="true" className="text-muted">•</span> : null}
										{item.publishedAt ? (
											<time dateTime={item.publishedAt} suppressHydrationWarning className="text-muted">
												{ago(item)}
											</time>
										) : null}
									</p>
								</SiteLink>
							</li>
						);
					})}
				</ul>
				{showAds ? <AdSlot size="mobile" label={labels.adLabel} fluid className="mt-6" /> : null}
			</div>

			<div className="space-y-6 lg:col-span-7" aria-live={playback.autoplay && !paused ? "off" : "polite"}>
				<figure>
					<SiteLink href={current.url} className="relative block aspect-[689/474] overflow-hidden rounded-2xl bg-neutral-100 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.1),0_4px_6px_-1px_rgba(0,0,0,0.1)]">
						<NewsImage key={current.id} image={current.image} sizes="(min-width: 1280px) 689px, 100vw" />
						{current.kicker ? (
							<span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[11px]/4 font-bold uppercase tracking-[0.55px] text-white">{current.kicker}</span>
						) : null}
					</SiteLink>
					{current.excerpt ? (
						<figcaption className="mt-4 text-sm/5 text-[#404040]">
							{current.excerpt}{" "}
							<SiteLink href={current.url} className="text-primary underline underline-offset-2">
								{labels.readMore}
							</SiteLink>
						</figcaption>
					) : null}
				</figure>
				{notice ? <Notice notice={notice} /> : null}
			</div>
		</div>
	);
}
