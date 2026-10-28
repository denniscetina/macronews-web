import Image from "next/image";
import SiteLink from "@/components/ui/SiteLink";

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
 * The tag color per category in the design is not in the CMS: every tag uses the Darkred one.
 */
export function CompactCard({ item }) {
	return (
		<SiteLink
			href={item.url}
			className="group relative isolate block aspect-[290/222.86] overflow-hidden rounded-2xl border border-neutral-200 bg-charcoal shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
		>
			<NewsImage image={item.image} sizes="(min-width: 1280px) 290px, (min-width: 768px) 33vw, 80vw" className="transition duration-300 ease-out group-hover:scale-105" />
			<div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
			{item.kicker ? (
				<span className="absolute left-3 top-3 rounded-[2px] bg-burgundy px-2 py-0.5 text-[9px]/[13.5px] font-extrabold uppercase tracking-[0.45px] text-surface">
					{item.kicker}
				</span>
			) : null}
			<div className="absolute inset-x-0 bottom-0 p-3">
				<h3 className="line-clamp-3 text-sm/5 font-bold text-white">{item.title}</h3>
			</div>
		</SiteLink>
	);
}

/**
 * `cards` card (Figma "Article - Story", 290x476): 4:3 image with a pill tag (#7F0000, radius full), then title,
 * excerpt and a footer with author and reading time. The design sets these texts in Work Sans / Public Sans, fonts the
 * project does not load: Inter is used with the same size, weight and color (pending with design).
 */
export function StoryCard({ item, labels }) {
	return (
		<article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline outline-1 -outline-offset-1 outline-neutral-200">
			<SiteLink href={item.url} className="group relative block aspect-[4/3] shrink-0 overflow-hidden bg-charcoal">
				<NewsImage image={item.image} sizes="(min-width: 1280px) 290px, (min-width: 768px) 33vw, 80vw" className="transition duration-300 ease-out group-hover:scale-105" />
				{item.kicker ? (
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
					{item.excerpt ? <p className="line-clamp-4 text-sm/[21px] text-[#5b403c]">{item.excerpt}</p> : null}
				</div>
				<footer className="flex items-center justify-between gap-2 pt-2 text-xs/4 tracking-[0.12px] text-[#5f5e60]">
					<span className="truncate">{item.author ? labels.by.replace("{name}", item.author) : ""}</span>
					{item.readingTime ? <span className="shrink-0">{labels.readingTime.replace("{n}", String(item.readingTime))}</span> : null}
				</footer>
			</div>
		</article>
	);
}
