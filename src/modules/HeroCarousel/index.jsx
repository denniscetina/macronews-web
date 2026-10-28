import Image from "next/image";
import SectionFrame from "@/components/ui/SectionFrame";
import { getDictionary } from "@/i18n";
import Slides from "./Slides.client";

// Own spacing when the editor leaves a side on "default" (Figma: the hero breathes vertically, the container handles the sides).
const DEFAULTS = {
	padding: {
		desktop: { top: "var(--space-2xl)", right: "0", bottom: "var(--space-2xl)", left: "0" },
		mobile: { top: "var(--space-lg)", right: "0", bottom: "var(--space-lg)", left: "0" },
	},
};

/** Full-bleed background image (desktop and mobile variants; mobile falls back to desktop). */
function BackgroundImage({ image }) {
	const desktop = image.desktop;
	const mobile = image.mobile ?? desktop;
	if (!desktop) {
		return null;
	}
	return (
		<>
			{mobile ? <Image src={mobile.url} alt="" fill sizes="100vw" className="object-cover md:hidden" /> : null}
			<Image src={desktop.url} alt="" fill sizes="100vw" className="hidden object-cover md:block" />
		</>
	);
}

/**
 * Main banner: carousel of slides (news or custom, the CMS resolves them) on a brand-colored background.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function HeroCarousel({ data, lang }) {
	if (data.slides.length === 0) {
		return null;
	}
	const { modules } = await getDictionary(lang);
	const dark = data.theme === "dark";
	return (
		<SectionFrame
			spacing={data.spacing}
			defaults={DEFAULTS}
			backgroundColor={data.background.color}
			theme={data.theme}
			aria-roledescription="carousel"
			aria-label={modules.carousel.region}
			className={`relative overflow-hidden ${dark ? "bg-primary text-white" : "bg-white text-ink"}`}
		>
			<BackgroundImage image={data.background.image} />
			<div className="container-site relative">
				<Slides slides={data.slides} dark={dark} navigation={data.navigation} playback={data.playback} labels={modules.carousel} />
			</div>
		</SectionFrame>
	);
}
