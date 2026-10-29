import AdSlot from "@/components/ui/AdSlot";
import SectionFrame from "@/components/ui/SectionFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import { colorVar } from "@/lib/design-tokens";
import { getDictionary } from "@/i18n";
import List from "./List.client";

// Figma "Macro Secciones": 1px #E5E5E5 line on top, 32px padding, a container of up to 1280px with 64px sides and 32px
// below (the heading adds 64px above and 48px below, see the markup).
const DEFAULTS = {
	padding: {
		desktop: { top: "2rem", right: "2rem", bottom: "2rem", left: "2rem" },
		mobile: { top: "1.5rem", right: "1rem", bottom: "1.5rem", left: "1rem" },
	},
};

/**
 * Expandable list of editor-written items (CMS ItemCollection, first use: "Macro Secciones"). Variant `list` is the
 * only one that exists. The accent color (CMS slug) paints the eyebrow, the number and title of the active item and its button.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function ItemCollection({ data, lang }) {
	if (data.items.length === 0) {
		return null;
	}
	const { modules } = await getDictionary(lang);
	const dark = data.theme === "dark";
	const accent = colorVar(data.accentColor) ?? "var(--color-primary)";
	return (
		<SectionFrame
			spacing={data.spacing}
			defaults={DEFAULTS}
			backgroundColor={data.backgroundColor}
			theme={data.theme}
			className={`border-t ${dark ? "border-white/15 bg-ink text-white" : "border-[#e5e5e5] bg-white text-ink"}`}
		>
			<div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-0 pb-8 md:px-16">
				<div className="pb-8 pt-10 md:pb-12 md:pt-16">
					<SectionHeading heading={data.heading} dark={dark} eyebrowColor={accent} variant="split" />
				</div>
				<List
					items={data.items}
					showNumbering={data.showNumbering}
					imagePosition={data.imagePosition}
					accent={accent}
					dark={dark}
					labels={modules.items}
				/>
			</div>
			{/* Figma "Placeholder Ad": below the list, inside the section. The CMS has no ads field for this module: the position is the frontend's. */}
			<AdSlot size="banner" label={modules.news.adLabel} className="mx-auto" />
		</SectionFrame>
	);
}
