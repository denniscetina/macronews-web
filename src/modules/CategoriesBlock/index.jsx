import SectionFrame from "@/components/ui/SectionFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import { getDictionary } from "@/i18n";
import Categories from "./Categories.client";

// Figma "Section\Categories": the content box is 1280px with 32px sides and 96px below it.
const DEFAULTS = {
	padding: {
		desktop: { top: "2rem", right: "0", bottom: "6rem", left: "0" },
		mobile: { top: "1.5rem", right: "0", bottom: "3rem", left: "0" },
	},
};

/**
 * List of news categories (CMS `categories[]`, already ordered and limited) with a panel on the side showing the
 * news of the chosen one. Variant `list` is the only one that exists.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function CategoriesBlock({ data, lang }) {
	if (data.categories.length === 0) {
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
			className={dark ? "bg-ink text-white" : "bg-white text-ink"}
		>
			<div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
				<div className="mb-8 border-b border-neutral-200 pb-4">
					<SectionHeading heading={data.heading} dark={dark} />
				</div>
				<Categories
					categories={data.categories}
					showNumbering={data.showNumbering}
					showPosts={data.showPosts}
					viewAllLabel={data.viewAllLabel}
					navigation={data.navigation}
					playback={data.playback}
					labels={modules.categories}
					carouselLabels={modules.carousel}
					dark={dark}
				/>
			</div>
		</SectionFrame>
	);
}
