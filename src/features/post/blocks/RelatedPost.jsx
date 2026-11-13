import SiteLink from "@/components/ui/SiteLink";
import CardMeta from "@/modules/NewsCarousel/CardMeta";

/**
 * `RelatedPost` block, the "Te puede interesar" box of the Figma `Single Post`: a white card with a red label (the CMS `eyebrow`),
 * the news title (bold) and its metadata line (the CMS `meta`: location, author, date or reading time). The design has no photo.
 * @param {{ data: { eyebrow: string, meta: string[], item: any }, labels: Record<string, string>, newsLabels: any, lang: string }} props
 */
export default function RelatedPost({ data, labels, newsLabels, lang }) {
	return (
		<SiteLink href={data.item.url} className="group flex cursor-pointer flex-col gap-2 rounded-xl bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
			<span className="inline-block self-start rounded bg-macro-red px-2 py-1 text-[10px]/3 font-bold uppercase tracking-[0.5px] text-white">{data.eyebrow || labels.related}</span>
			<h3 className="text-[15px]/5 font-bold text-[#171717] group-hover:text-primary">{data.item.title}</h3>
			<CardMeta item={data.item} meta={data.meta} labels={newsLabels} lang={lang} className="text-xs/4 text-[#737373]" dot="bg-[#737373]" />
		</SiteLink>
	);
}
