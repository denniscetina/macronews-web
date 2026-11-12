"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import AdSlot from "@/components/ui/AdSlot";
import SiteLink from "@/components/ui/SiteLink";
import CardMeta from "@/modules/NewsCarousel/CardMeta";

/** An ad goes after every 4 posts (Figma: 4 posts, ad, 4 posts, ad, 2 posts). */
const AD_EVERY = 4;

/**
 * One post of the list (Figma `Item List`, 828x158): 220x158 photo, 24px gap and a 584px column with 8px above and
 * below: the title (Montserrat 500 14/20), the excerpt (Inter 400 12/18) and, 8px lower, "Leer Noticia" + arrow
 * (Inter 500 12/16, macro red) on the left and the meta (location, dot, "Hace 45 min": Inter 12/16) on the right.
 * The whole post is one link. The design draws no category label, so `kicker` is not shown.
 */
function Post({ item, card, labels, newsLabels, lang }) {
	return (
		<SiteLink href={item.url} className="group flex flex-col gap-4 md:flex-row md:gap-6">
			<div className="relative aspect-[220/158] w-full shrink-0 overflow-hidden bg-[#e5e5e5] md:h-[158px] md:w-[220px]">
				{item.image ? <Image src={item.image.url} alt="" fill sizes="(min-width: 768px) 220px, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" /> : null}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-2 md:py-2">
				<h3 className="font-display text-sm/5 font-medium text-[#171717] group-hover:text-primary">{item.title}</h3>
				{card.showExcerpt && item.excerpt ? <p className="line-clamp-3 text-xs/[18px] text-[#404040]">{item.excerpt}</p> : null}
				<div className="mt-auto flex items-center justify-between gap-4 pt-2 text-xs/4">
					<span className="inline-flex items-center gap-1 font-medium text-macro-red">
						{labels.readMore}
						<svg viewBox="0 0 16 16" aria-hidden="true" className="size-3 fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M3 8h10M9 4l4 4-4 4" />
						</svg>
					</span>
					<CardMeta item={item} meta={card.meta} labels={newsLabels} lang={lang} className="justify-end text-[#737373]" dot="bg-[#737373]" />
				</div>
			</div>
		</SiteLink>
	);
}

/**
 * The posts with their ads and the "Cargar más" button. `initial` posts show first and each click reveals `initial` more
 * of the ones the CMS already sent (there is no endpoint to ask for more yet).
 * @param {{ items: any[], initial: number, card: any, ads: any, lang: string, labels: Record<string, string>, newsLabels: any, adLabel: string }} props
 */
export default function List({ items, initial, card, ads, lang, labels, newsLabels, adLabel }) {
	const [visible, setVisible] = useState(initial);
	const shown = items.slice(0, visible);
	return (
		<>
			<ul aria-label={labels.list} className="flex flex-col gap-8">
				{shown.map((item, index) => (
					<Fragment key={item.id}>
						<li>
							<Post item={item} card={card} labels={labels} newsLabels={newsLabels} lang={lang} />
						</li>
						{ads && (index + 1) % AD_EVERY === 0 && index < shown.length - 1 ? (
							<li className="empty:hidden">
								<AdSlot ads={ads} lang={lang} label={adLabel} />
							</li>
						) : null}
					</Fragment>
				))}
			</ul>
			{visible < items.length ? (
				<div className="mt-8 flex justify-center">
					<button
						type="button"
						onClick={() => setVisible((count) => count + initial)}
						className="cursor-pointer rounded-lg bg-[#a3a3a3]/20 px-4 py-1 font-display text-xs/6 font-medium tracking-[-0.18px] text-[#171717] transition hover:bg-[#a3a3a3]/35"
					>
						{labels.loadMore}
					</button>
				</div>
			) : null}
		</>
	);
}
