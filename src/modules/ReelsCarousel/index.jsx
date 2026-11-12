import AdSlot from "@/components/ui/AdSlot";
import SectionFrame from "@/components/ui/SectionFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import { getDictionary } from "@/i18n";
import { getSite } from "@/server/services/site";
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
 * core does not fall back to older ones). A card opens the Reel Mode: a full screen gallery with the video (there is no
 * page per reel). The gallery has no design in the Figma yet, so it follows the core. Only the desktop cards are designed.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function ReelsCarousel({ data, lang }) {
	if (data.items.length === 0) {
		return null;
	}
	const [{ modules }, site] = await Promise.all([getDictionary(lang), getSite()]);
	const settings = site?.reels ?? { autoplay: true, startMuted: true, onEnd: "next", continueWithLatest: true, adFrequency: 0 };
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
					{data.ads ? <AdSlot ads={data.ads} lang={lang} label={modules.news.adLabel} only="desktop" className="w-full justify-self-end" /> : null}
				</div>
				<Carousel
					items={data.items}
					slidesPerView={data.slidesPerView}
					navigation={data.navigation}
					feed={data.feed}
					settings={settings}
					labels={modules.reels}
					newsLabels={modules.news}
					carouselLabels={modules.carousel}
					lang={lang}
				/>
			</div>
		</SectionFrame>
	);
}
