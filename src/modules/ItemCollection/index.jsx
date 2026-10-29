import SectionFrame from "@/components/ui/SectionFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import { colorVar } from "@/lib/design-tokens";
import { getDictionary } from "@/i18n";
import List from "./List.client";

// Figma "Macro Secciones": 1280px content box, 96px above and below.
const DEFAULTS = {
	padding: {
		desktop: { top: "6rem", right: "0", bottom: "6rem", left: "0" },
		mobile: { top: "3rem", right: "0", bottom: "3rem", left: "0" },
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
			className={dark ? "bg-ink text-white" : "bg-white text-ink"}
		>
			<div className="mx-auto w-full max-w-[1280px] px-4 md:px-8">
				<div className="mb-12">
					<SectionHeading heading={data.heading} dark={dark} eyebrowColor={accent} />
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
		</SectionFrame>
	);
}
