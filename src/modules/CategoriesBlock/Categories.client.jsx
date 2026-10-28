"use client";

import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import { useState } from "react";
import SiteLink from "@/components/ui/SiteLink";
import { NewsImage } from "@/modules/NewsCarousel/Cards";

function Chevron({ direction }) {
	return (
		<svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5 fill-none stroke-current" strokeWidth="1.17">
			<path d={direction === "prev" ? "M8.75 2.92 4.67 7l4.08 4.08" : "M5.25 2.92 9.33 7l-4.08 4.08"} />
		</svg>
	);
}

/** Slide of the panel (Figma "Background", 478.66x598.31): image, black gradient, 32px padding, content at the bottom. */
function PostSlide({ post }) {
	return (
		<SiteLink href={post.url} className="relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden bg-charcoal p-8">
			<NewsImage image={post.image} sizes="(min-width: 1024px) 479px, 100vw" />
			<div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
			<div className="relative">
				{post.kicker ? (
					<span className="mb-2 inline-block rounded bg-accent px-2.5 py-1 text-[10px]/[15px] font-bold uppercase tracking-[0.5px] text-macro-black">{post.kicker}</span>
				) : null}
				<h3 className="font-display text-2xl/8 font-bold text-white">{post.title}</h3>
				{post.excerpt ? <p className="mt-2 line-clamp-3 text-xs/[19.5px] text-[#d4d4d4]">{post.excerpt}</p> : null}
			</div>
		</SiteLink>
	);
}

/** Panel of the active category: a Splide with its news, one at a time (the empty ones show a note). */
function Panel({ category, viewAllLabel, navigation, playback, labels, carouselLabels }) {
	const posts = category.posts;
	const many = posts.length > 1;
	return (
		<div className="relative overflow-hidden rounded-3xl bg-charcoal shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
			{posts.length === 0 ? (
				<div className="flex aspect-[4/5] flex-col justify-end bg-gradient-to-br from-charcoal to-black p-8">
					<h3 className="font-display text-2xl/8 font-bold text-white">{category.name}</h3>
					<p className="mt-2 text-xs/[19.5px] text-[#d4d4d4]">{labels.noPosts}</p>
				</div>
			) : (
				<Splide
					key={category.id}
					hasTrack={false}
					className="cat-splide"
					options={{
						type: many ? "loop" : "slide",
						arrows: navigation.showArrows && many,
						pagination: navigation.showPagination && many,
						drag: playback.touchEnabled && many,
						autoplay: playback.autoplay && many,
						interval: playback.autoplayInterval,
						pauseOnHover: playback.pauseOnHover,
						pauseOnFocus: true,
						speed: 500,
						label: category.name,
						reducedMotion: { speed: 0, rewindSpeed: 0, autoplay: "pause" },
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
							{posts.map((post) => (
								<SplideSlide key={post.id}>
									<PostSlide post={post} />
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
			)}
			{viewAllLabel && category.url ? (
				<SiteLink
					href={category.url}
					className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-4 py-2 text-xs/4 font-semibold uppercase tracking-[0.6px] text-white backdrop-blur transition hover:bg-white/30"
				>
					{viewAllLabel}
				</SiteLink>
			) : null}
		</div>
	);
}

/**
 * `list` variant: big category names on the left (7 of 12 columns), the news of the chosen one on the right (5 of 12).
 * The category follows hover / focus / the first tap; the next click on the active one (or on its arrow) opens its archive.
 * Figma rows: 1px #E5E5E5 line on top, 60/60 Montserrat 900 name (#C5111A active, #A3A3A3 the rest), 14px number.
 */
export default function Categories({ categories, showNumbering, showPosts, viewAllLabel, navigation, playback, labels, carouselLabels }) {
	const [active, setActive] = useState(0);
	const current = categories[active];

	return (
		<div className="grid gap-8 lg:grid-cols-[minmax(0,689.33fr)_minmax(0,478.67fr)] lg:gap-12">
			<ul aria-label={labels.list}>
				{categories.map((category, index) => {
					const isActive = index === active;
					return (
						<li key={category.id} className="border-t border-neutral-200 last:border-t-0">
							<SiteLink
								href={category.url}
								aria-current={isActive}
								aria-label={labels.goTo.replace("{name}", category.name)}
								onMouseEnter={() => setActive(index)}
								onFocus={() => setActive(index)}
								onClick={(event) => {
									// First tap on a touch screen only chooses the category; the second one opens it.
									if (!isActive && showPosts) {
										event.preventDefault();
										setActive(index);
									}
								}}
								className="group flex items-start gap-[22px] py-5"
							>
								{showNumbering ? (
									<span aria-hidden="true" className="mt-8 w-5 shrink-0 font-display text-sm/5 font-medium text-gray">
										{String(index + 1).padStart(2, "0")}
									</span>
								) : null}
								<span
									className={`flex items-center gap-4 font-display text-[2.25rem]/[2.25rem] font-black uppercase tracking-[-0.05em] transition-colors duration-300 ease-out sm:text-5xl/[3rem] lg:text-[60px]/[60px] ${
										isActive ? "text-primary" : "text-gray group-hover:text-primary"
									}`}
								>
									{category.name}
									{isActive && category.url ? (
										<svg viewBox="0 0 24 24" aria-hidden="true" className="size-8 shrink-0 fill-none stroke-current stroke-[2.5] lg:size-10">
											<path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
										</svg>
									) : null}
								</span>
							</SiteLink>
						</li>
					);
				})}
			</ul>
			{showPosts ? (
				<div className="self-center" aria-live="polite">
					<Panel category={current} viewAllLabel={viewAllLabel} navigation={navigation} playback={playback} labels={labels} carouselLabels={carouselLabels} />
				</div>
			) : null}
		</div>
	);
}
