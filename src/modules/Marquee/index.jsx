import SectionFrame from "@/components/ui/SectionFrame";
import { getDictionary } from "@/i18n";
import Ticker from "./Ticker.client";

const DEFAULTS = {};

/**
 * Announcement bar: news or a custom notice (the CMS resolves `items`).
 * The validity window (`schedule`) is evaluated in the browser, the page itself is cached.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function Marquee({ data, lang }) {
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
			aria-label={modules.marquee.label}
			className={dark ? "bg-primary text-white" : "bg-white text-ink"}
		>
			<Ticker
				items={data.items}
				schedule={data.schedule}
				animation={data.animation}
				fontWeight={data.fontWeight}
				buttonVariant={data.buttonVariant}
				dark={dark}
			/>
		</SectionFrame>
	);
}
