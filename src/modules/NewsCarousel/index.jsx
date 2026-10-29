import AdSlot from "@/components/ui/AdSlot";
import SectionFrame from "@/components/ui/SectionFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import { getDictionary } from "@/i18n";
import Carousel from "./Carousel.client";
import List from "./List.client";

// Figma "Section - ...": 32px above and 48px below the content, white; the content box is 1360px with 24px sides.
const DEFAULTS = {
	padding: {
		desktop: { top: "2rem", right: "0", bottom: "3rem", left: "0" },
		mobile: { top: "1.5rem", right: "0", bottom: "2rem", left: "0" },
	},
};
// Figma "Section\AHORA CERCA DE TI" (the `list` variant): 1px #E5E5E5 line above and below, 64px above, 128px below and
// 32px at the sides, a container of up to 1280px with 48px between the title and the two columns.
const LIST_DEFAULTS = {
	padding: {
		desktop: { top: "4rem", right: "2rem", bottom: "8rem", left: "2rem" },
		mobile: { top: "1.5rem", right: "0", bottom: "2rem", left: "0" },
	},
};

/**
 * News by category, tag, date or location in three presentations (`layoutVariant`): `compact` and `cards` are
 * Splide carousels, `list` is a titles list with a featured news. The CMS resolves the news (`items`); only
 * the `nearby` query is resolved by the reader's location at run time.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function NewsCarousel({ data, lang }) {
	const { modules } = await getDictionary(lang);
	const dark = data.theme === "dark";
	const isList = data.layoutVariant === "list";
	if (!isList && data.items.length === 0) {
		return null;
	}
	return (
		<SectionFrame
			spacing={data.spacing}
			defaults={isList ? LIST_DEFAULTS : DEFAULTS}
			backgroundColor={data.backgroundColor}
			theme={data.theme}
			className={`${dark ? "bg-ink text-white" : "bg-white text-ink"} ${isList ? `border-y ${dark ? "border-white/15" : "border-[#e5e5e5]"}` : ""}`}
		>
			<div className={isList ? "mx-auto w-full max-w-[1280px] px-4 md:px-0" : "mx-auto w-full max-w-[1360px] px-4 md:px-6"}>
				<div className={`${isList ? "mb-8 md:mb-12" : "mb-8"} grid items-end gap-4 border-b border-neutral-200 pb-4 md:grid-cols-2 md:gap-1`}>
					<SectionHeading heading={data.heading} dark={dark} />
					{data.showAds ? <AdSlot size="leaderboard" label={modules.news.adLabel} className="hidden justify-self-end md:flex" /> : null}
				</div>
				{isList ? (
					<List items={data.items} nearby={data.nearby} notice={data.notice} playback={data.playback} showAds={data.showAds} labels={modules.news} lang={lang} />
				) : (
					<Carousel
						items={data.items}
						variant={data.layoutVariant}
						slidesPerView={data.slidesPerView}
						navigation={data.navigation}
						playback={data.playback}
						labels={modules.news}
						carouselLabels={modules.carousel}
					/>
				)}
			</div>
		</SectionFrame>
	);
}
