import AdSectionView from "./View.client";
import { getDictionary } from "@/i18n";

/**
 * Page section that is only an ad space (core `ad_section` 1.0.0): horizontal on desktop, square or vertical on mobile.
 * The piece is chosen in the browser; with none that fits, the whole section (its spacing included) is not painted.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function AdSection({ data, lang }) {
	if (!data.ads) {
		return null;
	}
	const { modules } = await getDictionary(lang);
	return <AdSectionView ads={data.ads} lang={lang} label={modules.news.adLabel} spacing={data.spacing} backgroundColor={data.backgroundColor} />;
}
