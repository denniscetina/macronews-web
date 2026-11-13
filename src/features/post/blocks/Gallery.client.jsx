"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";

function Photo({ image, priority = false }) {
	return <Image src={image.url} alt={image.alt} width={image.width ?? 1600} height={image.height ?? 1067} sizes="(min-width: 676px) 628px, 100vw" priority={priority} className="h-auto w-full rounded-lg" />;
}

function Arrow({ direction, label, onClick }) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className={`absolute top-1/2 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black ${direction === "prev" ? "left-2" : "right-2"}`}
		>
			<svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d={direction === "prev" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
			</svg>
		</button>
	);
}

/**
 * `Gallery` block. `carousel`: one photo at a time (Splide) with its own caption under it that changes with the photo, "3 / 8", and the
 * credit fixed below. `grid`: every photo in a grid, each with its caption under it, and the credit once at the end. The `title` is
 * the gallery's visible title, not a heading of the article (core). Not in the Figma: provisional, in the article's style.
 * @param {{ data: { layoutVariant: "carousel" | "grid", title: string, credit: string, images: any[] }, labels: Record<string, string>, carouselLabels: any }} props
 */
export default function Gallery({ data, labels, carouselLabels }) {
	const { images } = data;
	const [index, setIndex] = useState(0);
	const splideRef = useRef(null);
	return (
		<figure className="flex flex-col gap-2">
			{data.title ? <p className="text-sm/5 font-bold text-[#171717]">{data.title}</p> : null}
			{data.layoutVariant === "grid" ? (
				<ul className="grid grid-cols-2 gap-3">
					{images.map((image) => (
						<li key={image.id ?? image.url} className="flex flex-col gap-1">
							<Photo image={image} />
							{image.caption ? <span className="text-xs/4 text-[#737373]">{image.caption}</span> : null}
						</li>
					))}
				</ul>
			) : (
				<>
					<div className="relative">
						<Splide
							ref={splideRef}
							hasTrack={false}
							aria-label={data.title || labels.gallery}
							onMove={(splide, next) => setIndex(next)}
							options={{ type: "slide", perPage: 1, gap: 0, arrows: false, pagination: false, i18n: { slideX: carouselLabels.goTo.replace("{n}", "%s"), slideLabel: carouselLabels.slideLabel } }}
						>
							<SplideTrack>
								{images.map((image) => (
									<SplideSlide key={image.id ?? image.url}>
										<Photo image={image} />
									</SplideSlide>
								))}
							</SplideTrack>
						</Splide>
						{images.length > 1 ? (
							<>
								<Arrow direction="prev" label={carouselLabels.previous} onClick={() => splideRef.current?.splide?.go("<")} />
								<Arrow direction="next" label={carouselLabels.next} onClick={() => splideRef.current?.splide?.go(">")} />
							</>
						) : null}
					</div>
					<p aria-live="polite" className="flex items-start justify-between gap-4 text-xs/4 text-[#737373]">
						<span>{images[index]?.caption}</span>
						<span className="shrink-0 tabular-nums">{`${index + 1} / ${images.length}`}</span>
					</p>
				</>
			)}
			{data.credit ? <figcaption className="text-xs/4 font-medium text-[#737373]">{data.credit}</figcaption> : null}
		</figure>
	);
}
