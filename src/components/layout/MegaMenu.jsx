import SiteLink from "@/components/ui/SiteLink";
import { timeAgo } from "@/lib/relative-time";
import { NewsImage } from "@/modules/NewsCarousel/Cards";

function Arrow({ className = "size-3" }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-none stroke-current stroke-2`}>
			<path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

/** Section card (Figma: 201.92px, radius 8, 1px #E5E5E5, padding 10, gap 6). The highlighted one is wide with a dark-red border. */
function SectionCard({ section }) {
	const wide = section.highlighted;
	return (
		<SiteLink
			href={section.href}
			external={section.external}
			className={`group flex rounded-lg border bg-white p-2.5 transition-colors hover:border-primary ${wide ? "col-span-2 items-center justify-between gap-3 border-[#7f0000]/40" : "flex-col gap-1.5 border-neutral-200"}`}
		>
			{wide ? (
				<>
					<span className="flex min-w-0 items-center gap-3">
						{section.badge ? (
							<span className="flex size-12 shrink-0 items-center justify-center rounded bg-primary p-1 text-center text-[7px]/[9px] font-black uppercase text-white">{section.badge}</span>
						) : null}
						<span className="min-w-0 space-y-1.5">
							<span className="block font-display text-xs/4 font-medium uppercase tracking-[0.3px] text-[#171717]">{section.title}</span>
							<span className="block text-[10px]/[14px] tracking-[0.5px] text-[#525252]">{section.description}</span>
						</span>
					</span>
					<Arrow className="size-3 shrink-0 text-primary" />
				</>
			) : (
				<>
					<span className="flex items-center justify-between gap-2">
						<span className="font-display text-xs/4 font-medium uppercase tracking-[0.3px] text-[#171717]">{section.title}</span>
						<svg viewBox="0 0 6 10" aria-hidden="true" className="h-1.5 w-[4px] shrink-0 fill-none stroke-gray stroke-[1.2] transition group-hover:stroke-primary">
							<path d="m1 1 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</span>
					<span className="text-[10px]/[14px] tracking-[0.5px] text-[#525252]">{section.description}</span>
				</>
			)}
		</SiteLink>
	);
}

/**
 * Mega menu panel of a main-menu item (Figma Header, Status=Open): 780px, radius 12, #F8F8F7, 1px #E5E5E5, padding 24.
 * Left: title + "view all" link and the section cards; right (after a 1px divider): the featured news.
 * Texts the CMS did not send (plain submenus) come from the dictionary with the item name.
 * @param {{ mega: NonNullable<ReturnType<typeof import("@/server/cms/mappers/site").mapSite>["menus"][string]["main"][number]["mega"]>, lang: string, agoLabels: any, labels: { title: string, viewAll: string, featured: string }, id: string, label: string }} props
 */
export default function MegaMenu({ mega, lang, agoLabels, labels, id, label }) {
	const { featured } = mega;
	const fill = (template) => template.replace("{name}", label);
	return (
		<div id={id} role="region" aria-label={label} className={`${featured ? "w-[780px]" : "w-[480px]"} max-w-[calc(100vw-2rem)] rounded-xl border border-neutral-200 bg-surface p-6 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]`}>
			<div className={`grid gap-6 ${featured ? "grid-cols-[minmax(0,1fr)_290px]" : ""}`}>
				<div className="space-y-3">
					<div className="flex items-end justify-between gap-4 border-b border-neutral-200 pb-2.5">
						<p className="font-display text-xs/3 font-extrabold uppercase text-[#171717]">{mega.title || fill(labels.title)}</p>
						{mega.viewAll ? (
							<SiteLink href={mega.viewAll.href} external={mega.viewAll.external} className="flex items-center gap-1 text-[10px]/4 font-medium tracking-[0.5px] text-primary hover:underline">
								{mega.viewAll.label || fill(labels.viewAll)}
								<Arrow />
							</SiteLink>
						) : null}
					</div>
					<div className="grid grid-cols-2 gap-3">
						{mega.sections.map((section) => (
							<SectionCard key={section.title} section={section} />
						))}
					</div>
				</div>

				{featured ? (
					<div className="space-y-3 border-l border-neutral-200 pl-6">
						<p className="border-b border-neutral-200 pb-3.5 font-display text-xs/3 font-extrabold uppercase text-primary">{fill(labels.featured)}</p>
						<article className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
							<SiteLink href={featured.href} external={featured.external} className="relative block aspect-[263/164.47] bg-charcoal">
								<NewsImage image={featured.image} sizes="263px" />
								{featured.kicker ? (
									<span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-[9px]/4 font-semibold uppercase tracking-[1.2px] text-[#feee00] backdrop-blur-sm">{featured.kicker}</span>
								) : null}
							</SiteLink>
							<div className="space-y-1.5 p-3">
								<h3 className="line-clamp-2 font-display text-xs/[15px] font-medium uppercase tracking-[0.6px] text-[#171717]">{featured.title}</h3>
								{featured.excerpt ? <p className="line-clamp-2 text-[10px]/[15px] tracking-[0.6px] text-[#525252]">{featured.excerpt}</p> : null}
								<div className="flex items-center justify-between gap-2 border-t border-neutral-200 pt-2">
									<time dateTime={featured.publishedAt ?? undefined} suppressHydrationWarning className="text-[8px]/4 uppercase tracking-[0.8px] text-muted">
										{timeAgo(featured.publishedAt, agoLabels, lang)}
									</time>
									{featured.ctaLabel ? (
										<SiteLink href={featured.href} external={featured.external} className="flex items-center gap-2 text-[10px]/4 font-medium uppercase tracking-[1.2px] text-primary hover:underline">
											{featured.ctaLabel}
											<Arrow />
										</SiteLink>
									) : null}
								</div>
							</div>
						</article>
					</div>
				) : null}
			</div>
		</div>
	);
}
