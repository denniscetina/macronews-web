import Image from "next/image";
import SiteLink from "@/components/ui/SiteLink";
import CardMeta from "./CardMeta";

/** Featured image of a news item, covering its box; posts without one get a brand gradient. */
export function NewsImage({ image, sizes, priority = false, className = "" }) {
	return image ? (
		<Image src={image.url} alt={image.alt} fill sizes={sizes} priority={priority} className={`object-cover ${className}`} />
	) : (
		<div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-burgundy to-ink" />
	);
}

/**
 * `compact` card (Figma "Article - Story", 290x222.86): image with a black gradient, category tag top-left
 * (Darkred #820025, Inter 800 9/13.5) and the title over the bottom (Inter 700 14/20 white, 3 lines).
 * The tag color per category in the design is not in the CMS: every tag uses the Darkred one. It follows the CMS `card`:
 * the tag only when `showCategory`, and the metadata line (none by default; not in the design) under the title.
 * @param {{ item: any, card: { showCategory: boolean, meta: string[] }, labels: any, lang: string }} props
 */
export function CompactCard({ item, card, labels, lang }) {
	return (
		<SiteLink
			href={item.url}
			className="group relative isolate block aspect-[290/222.86] overflow-hidden rounded-2xl border border-neutral-200 bg-charcoal shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
		>
			<NewsImage image={item.image} sizes="(min-width: 1280px) 290px, (min-width: 768px) 33vw, 80vw" className="transition duration-300 ease-out group-hover:scale-105" />
			<div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
			{card.showCategory && item.kicker ? (
				<span className="absolute left-3 top-3 rounded-[2px] bg-burgundy px-2 py-0.5 text-[9px]/[13.5px] font-extrabold uppercase tracking-[0.45px] text-surface">
					{item.kicker}
				</span>
			) : null}
			<div className="absolute inset-x-0 bottom-0 p-3">
				<h3 className="line-clamp-3 text-sm/5 font-bold text-white">{item.title}</h3>
				<CardMeta item={item} meta={card.meta} labels={labels} lang={lang} className="mt-1 text-[11px]/4 text-white/80" dot="bg-white/60" />
			</div>
		</SiteLink>
	);
}

/**
 * `cards` card (Figma "Article - Story", 290x476): 4:3 image with a pill tag (#7F0000, radius full), then title,
 * excerpt and a footer. The design sets these texts in Work Sans / Public Sans, fonts the project does not load: Inter is used
 * with the same size, weight and color (pending with design). The pill, the excerpt and the footer follow the CMS `card`
 * (the design's author and reading time are just one choice of `card.meta`; the core default for `cards` is the date).
 * @param {{ item: any, card: { showCategory: boolean, showExcerpt: boolean, meta: string[] }, labels: any, lang: string }} props
 */
export function StoryCard({ item, card, labels, lang }) {
	return (
		<article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline outline-1 -outline-offset-1 outline-neutral-200">
			<SiteLink href={item.url} className="group relative block aspect-[4/3] shrink-0 overflow-hidden bg-charcoal">
				<NewsImage image={item.image} sizes="(min-width: 1280px) 290px, (min-width: 768px) 33vw, 80vw" className="transition duration-300 ease-out group-hover:scale-105" />
				{card.showCategory && item.kicker ? (
					<span className="absolute left-3 top-3 rounded-full bg-[#7f0000] px-2.5 py-1 text-[11px]/[14px] font-bold uppercase tracking-[0.55px] text-white">{item.kicker}</span>
				) : null}
			</SiteLink>
			<div className="flex flex-1 flex-col gap-[24.75px] px-4 pb-4 pt-[14.75px]">
				<div className="flex-1 space-y-2 pb-3">
					<h3 className="line-clamp-3 text-lg/[24.75px] font-semibold tracking-[-0.18px] text-[#1a1c1d]">
						<SiteLink href={item.url} className="hover:text-primary">
							{item.title}
						</SiteLink>
					</h3>
					{card.showExcerpt && item.excerpt ? <p className="line-clamp-4 text-sm/[21px] text-[#5b403c]">{item.excerpt}</p> : null}
				</div>
				<CardMeta item={item} meta={card.meta} labels={labels} lang={lang} className="pt-2 text-xs/4 tracking-[0.12px] text-[#5f5e60]" dot="bg-[#5f5e60]" />
			</div>
		</article>
	);
}

/** "17 Septiembre" (Figma `Category Page` card): day and month with a capital, in Cancún time; empty when the date is not valid. */
function shortDate(iso, lang) {
	const time = iso ? Date.parse(iso) : Number.NaN;
	if (!Number.isFinite(time)) {
		return "";
	}
	const parts = Object.fromEntries(new Intl.DateTimeFormat(lang === "es" ? "es-MX" : lang, { day: "numeric", month: "long", timeZone: "America/Cancun" }).formatToParts(time).map((part) => [part.type, part.value]));
	return `${parts.day} ${parts.month.charAt(0).toUpperCase()}${parts.month.slice(1)}`;
}

/**
 * `cards` card of a section page (Figma `Category Page > Item Article`, 262 wide): 4:3 photo with a pill (MacroRed
 * #C5111A, radius full, padding 4/10; the design sets it in Work Sans 700 11/14 +0.88px, a font the project does not
 * load, so Inter), the title (Montserrat 500 14/20, #1A1C1D, up to 4 lines) and a footer (Inter 300 12/16, #5F5E60) with
 * the meta the CMS asks for (`card.meta`: date as "17 Septiembre", location, author, reading time). The CMS
 * `card.showCategory` and `card.showExcerpt` turn the pill and the excerpt on or off.
 * @param {{ item: any, card: { showCategory: boolean, showExcerpt: boolean, meta: string[] }, lang: string, labels: any }} props
 */
export function CategoryCard({ item, card, lang, labels }) {
	const meta = card.meta
		.map((key) =>
			key === "date" ? shortDate(item.publishedAt, lang) : key === "location" ? item.location : key === "author" ? (item.author ? labels.by.replace("{name}", item.author) : "") : item.readingTime ? labels.readingTime.replace("{n}", String(item.readingTime)) : "",
		)
		.filter(Boolean);
	return (
		<article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline outline-1 -outline-offset-1 outline-neutral-200">
			<SiteLink href={item.url} className="group relative block aspect-[4/3] shrink-0 overflow-hidden bg-charcoal">
				<NewsImage image={item.image} sizes="(min-width: 1280px) 262px, (min-width: 768px) 33vw, 80vw" className="transition duration-300 ease-out group-hover:scale-105" />
				{card.showCategory && item.kicker ? (
					<span className="absolute left-3 top-3 rounded-full bg-macro-red px-2.5 py-1 text-[11px]/[14px] font-bold uppercase tracking-[0.88px] text-white">{item.kicker}</span>
				) : null}
			</SiteLink>
			<div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-[14.75px]">
				<h3 className="line-clamp-4 font-display text-sm/5 font-medium text-[#1a1c1d]">
					<SiteLink href={item.url} className="hover:text-primary">
						{item.title}
					</SiteLink>
				</h3>
				{card.showExcerpt && item.excerpt ? <p className="line-clamp-3 text-xs/[18px] text-[#5b403c]">{item.excerpt}</p> : null}
				{meta.length > 0 ? (
					<footer className="mt-auto flex items-center gap-2 pt-2 text-xs/4 font-light tracking-[0.12px] text-[#5f5e60]">
						{meta.map((part) => (
							<span key={part}>{part}</span>
						))}
					</footer>
				) : null}
			</div>
		</article>
	);
}
