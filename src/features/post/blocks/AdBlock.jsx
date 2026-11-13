import AdSlot from "@/components/ui/AdSlot";

/**
 * `AdSlot` block: an ad space inside the body. It uses the same `ad_section` space and the same browser-side choice as the page
 * ads (`components/ads`); with no piece that fits, the space collapses.
 * @param {{ data: { ads: any }, lang: string, label: string }} props
 */
export default function AdBlock({ data, lang, label }) {
	return <AdSlot ads={data.ads} lang={lang} label={label} />;
}
