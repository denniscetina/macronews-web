import AdSlot from "@/components/ui/AdSlot";
import SectionFrame from "@/components/ui/SectionFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import { getDictionary } from "@/i18n";
import Carousel from "./Carousel.client";

// Figma "Section\Macro reels": 1px #171717 line on top, 96px above and below, 32px at the sides, a container of up
// to 1280px with 48px between the header and the cards.
const DEFAULTS = {
	padding: {
		desktop: { top: "6rem", right: "2rem", bottom: "6rem", left: "2rem" },
		mobile: { top: "2.5rem", right: "1.25rem", bottom: "2.5rem", left: "1.25rem" },
	},
};

/**
 * Carousel of vertical reel cards (CMS ReelsCarousel, "Macro Reels"). The section hides itself with no reels (the
 * core does not fall back to older ones). A card links to the reel's own page for now: the Reel Mode (full screen
 * modal) is not built yet. Only the desktop design is implemented.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function ReelsCarousel({ data, lang }) {
	if (data.items.length === 0) {
		return null;
	}
	const { modules } = await getDictionary(lang);
	const dark = data.theme === "dark";
	return (
		<SectionFrame
			spacing={data.spacing}
			defaults={DEFAULTS}
			backgroundColor={data.backgroundColor}
			theme={data.theme}
			className={`border-t ${dark ? "border-[#171717] bg-[#0e0e0e] text-white" : "border-[#e5e5e5] bg-white text-ink"}`}
		>
			<div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 md:gap-12">
				<div className={`grid items-end gap-4 border-b pb-4 md:grid-cols-2 md:gap-0 ${dark ? "border-[#262626]" : "border-neutral-200"}`}>
					<SectionHeading heading={data.heading} dark={dark} />
					{data.showAds ? <AdSlot size="leaderboard" label={modules.news.adLabel} fluid className="hidden justify-self-end md:flex" /> : null}
				</div>
				<Carousel
					items={data.items}
					slidesPerView={data.slidesPerView}
					navigation={data.navigation}
					labels={modules.reels}
					newsLabels={modules.news}
					carouselLabels={modules.carousel}
					lang={lang}
				/>
			</div>
		</SectionFrame>
	);
}
