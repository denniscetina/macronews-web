import RelativeTime from "@/components/ui/RelativeTime";

/**
 * Metadata line of a news card: the data `card.meta` asks for, in that order, each with its own format (core guide: location and
 * author as they come, date relative, reading time "4 min de lectura"). A datum the news does not have is left out without
 * leaving its separator, and no data at all means no line.
 * @param {{ item: any, meta: string[], labels: any, lang: string, className?: string, dot?: string }} props `labels`: `modules.news`; `dot`: color of the separator
 */
export default function CardMeta({ item, meta, labels, lang, className = "", dot = "bg-current" }) {
	const parts = meta
		.map((key) => {
			if (key === "location" || key === "author") {
				return item[key] ? { key, node: item[key] } : null;
			}
			if (key === "date") {
				return item.publishedAt ? { key, node: <RelativeTime iso={item.publishedAt} labels={labels.ago} lang={lang} /> } : null;
			}
			return item.readingTime ? { key, node: labels.readingTime.replace("{n}", String(item.readingTime)) } : null;
		})
		.filter(Boolean);
	if (parts.length === 0) {
		return null;
	}
	return (
		<p className={`flex flex-wrap items-center gap-2 ${className}`}>
			{parts.map((part, index) => (
				<span key={part.key} className="inline-flex items-center gap-2">
					{index > 0 ? <span aria-hidden="true" className={`size-1 rounded-full ${dot}`} /> : null}
					<span>{part.node}</span>
				</span>
			))}
		</p>
	);
}
