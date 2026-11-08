import SectionFrame from "@/components/ui/SectionFrame";
import { getDictionary } from "@/i18n";
import Row from "./Row.client";

/**
 * Row of topic circles (CMS StoriesCarousel, "Macro Historias"; Figma `Section\Interest topics`): 1px #E5E5E5 line on
 * top, a header with the subtitle (Montserrat 500 12/20, uppercase, #171717) over a 1px #E5E5E5 line, 32px, and the row.
 * The design draws a hidden title ("TEMAS Y PERSONAJES", Montserrat 900 20/32, -1px) above the subtitle: with no title
 * (the CMS sends it empty) its 32px + 4px are kept so the subtitle sits where the design puts it. A circle opens the Stories
 * Mode (`Viewer.client.jsx`, a modal; not designed yet, built from the core and dev-01's description).
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function StoriesCarousel({ data, lang }) {
	if (data.topics.length === 0) {
		return null;
	}
	const { modules } = await getDictionary(lang);
	const dark = data.theme === "dark";
	const { heading } = data;
	const Tag = heading?.level ?? "h2";
	return (
		<SectionFrame
			spacing={data.spacing}
			defaults={{}}
			backgroundColor={data.backgroundColor}
			theme={data.theme}
			className={`border-t px-4 md:px-8 ${dark ? "border-white/15 bg-ink text-white" : "border-[#e5e5e5] bg-white text-[#171717]"}`}
		>
			<div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8">
				{heading ? (
					<div className={`flex flex-col gap-1 border-b pb-4 ${dark ? "border-white/15" : "border-[#e5e5e5]"}`}>
						{heading.text ? (
							<Tag className="font-display text-xl/8 font-black uppercase tracking-[-1px]">{heading.text}</Tag>
						) : (
							<span aria-hidden="true" className="block h-8" />
						)}
						{heading.subtitle ? <p className="font-display text-xs/5 font-medium uppercase">{heading.subtitle}</p> : null}
					</div>
				) : null}
				<Row topics={data.topics} navigation={data.navigation} labels={modules.stories} carouselLabels={modules.carousel} dark={dark} />
			</div>
		</SectionFrame>
	);
}
