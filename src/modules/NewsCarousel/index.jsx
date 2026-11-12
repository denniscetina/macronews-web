import AdSlot from "@/components/ui/AdSlot";
import Topics from "./Topics";
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

// Figma `Category Page > Section: Lo más destacado {Category}` (the `cards` carousel of a section page): #FAFAFA band, 32px
// above, 72px below and 80px at the sides around a 1120px content with 4 cards.
const CATEGORY_DEFAULTS = {
	padding: {
		desktop: { top: "2rem", right: "0", bottom: "4.5rem", left: "0" },
		mobile: { top: "1.5rem", right: "0", bottom: "2rem", left: "0" },
	},
};

/**
 * News by category, tag, date or location in three presentations (`layoutVariant`): `compact` and `cards` are
 * Splide carousels, `list` is a titles list with a featured news. The CMS resolves the news (`items`); only
 * the `nearby` query is resolved by the reader's location at run time. The `cards` carousel of a section page (not the
 * home) has its own card (pill, title, date) and follows the CMS `card` options (category, excerpt, meta); on the home
 * it keeps the Figma home card (author and reading time).
 * @param {{ context?: { isHome: boolean }, data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function NewsCarousel({ data, lang, context }) {
	const { modules } = await getDictionary(lang);
	const dark = data.theme === "dark";
	const isList = data.layoutVariant === "list";
	const category = data.layoutVariant === "cards" && context?.isHome === false;
	if (!isList && data.items.length === 0) {
		return null;
	}
	return (
		<SectionFrame
			spacing={data.spacing}
			defaults={isList ? LIST_DEFAULTS : category ? CATEGORY_DEFAULTS : DEFAULTS}
			backgroundColor={data.backgroundColor}
			theme={data.theme}
			className={`${dark ? "bg-ink text-white" : "bg-white text-ink"} ${isList ? `border-y ${dark ? "border-white/15" : "border-[#e5e5e5]"}` : ""}`}
		>
			<div className={isList ? "mx-auto w-full max-w-[1280px] px-4 md:px-0" : category ? "mx-auto w-full max-w-[1280px] px-4 md:px-20" : "mx-auto w-full max-w-[1360px] px-4 md:px-6"}>
				<div className={`${isList ? "mb-8 md:mb-12" : "mb-8"} grid items-end gap-4 border-b border-neutral-200 pb-4 md:grid-cols-2 md:gap-1`}>
					<SectionHeading heading={data.heading} dark={dark} />
					{data.ads ? <AdSlot ads={data.ads} lang={lang} label={modules.news.adLabel} only="desktop" className="w-full justify-self-end" /> : null}
					{data.ads ? <AdSlot ads={data.ads} lang={lang} label={modules.news.adLabel} only="mobile" /> : null}
				</div>
				{data.topics.length > 0 && !data.nearby ? <Topics topics={data.topics} label={modules.news.topics} dark={dark} /> : null}
				{isList ? (
					<List items={data.items} nearby={data.nearby} notice={data.notice} playback={data.playback} card={data.card} labels={modules.news} lang={lang} />
				) : (
					<Carousel
						items={data.items}
						variant={data.layoutVariant}
						slidesPerView={data.slidesPerView}
						navigation={data.navigation}
						playback={data.playback}
						labels={modules.news}
						carouselLabels={modules.carousel}
						card={data.card}
						lang={lang}
						category={category}
					/>
				)}
			</div>
		</SectionFrame>
	);
}
