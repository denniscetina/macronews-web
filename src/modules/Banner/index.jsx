import Image from "next/image";
import SectionFrame from "@/components/ui/SectionFrame";
import SiteLink from "@/components/ui/SiteLink";
import { colorVar } from "@/lib/design-tokens";
import { getDictionary } from "@/i18n";
import { cleanHtml } from "@/server/content/clean-html";

/**
 * Minimum height per CMS `height`. `compact` is the Figma `Category Page > Hero` (418). `tall` is not designed (the core
 * leaves the exact heights to the frontend): a provisional 600/480. `screen` is what the core defines: the visible
 * screen minus the 79px header (`100svh`, so the mobile browser bar does not make it jump).
 */
const HEIGHTS = {
	compact: "min-h-[320px] md:min-h-[418px]",
	tall: "min-h-[480px] md:min-h-[600px]",
	screen: "min-h-[calc(100svh-79px)]",
};

/** CMS `buttonVariant` styles. The design draws no button: provisional, from the brand colors. */
const BUTTONS = {
	default: "bg-macro-red text-white hover:bg-burgundy",
	primary: "bg-macro-red text-white hover:bg-burgundy",
	secondary: "bg-yellow text-black hover:bg-white",
	outline: "border border-current bg-transparent hover:bg-white/10",
	link: "underline underline-offset-4 hover:opacity-80",
};

/** "12 de Septiembre, 2026" (Figma Dateline); other languages use their long date. Empty when the date is not valid. */
function formatDate(iso, lang) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return "";
	}
	const locale = lang === "es" ? "es-MX" : lang;
	const options = { day: "numeric", month: "long", year: "numeric", timeZone: "America/Cancun" };
	if (lang !== "es") {
		return new Intl.DateTimeFormat(locale, options).format(date);
	}
	const parts = Object.fromEntries(new Intl.DateTimeFormat(locale, options).formatToParts(date).map((part) => [part.type, part.value]));
	return `${parts.day} de ${parts.month.charAt(0).toUpperCase()}${parts.month.slice(1)}, ${parts.year}`;
}

/**
 * Hero of a section page (CMS `Banner`; Figma `Category Page > Hero`, 1280x418): photo with a 50% black layer, the
 * eyebrow as a yellow pill (Inter 700 11, +1px, radius 4, padding 6/14) over the title (Montserrat 900 56/64, -2px,
 * uppercase) at the top (112px of top padding) and, 32px from the bottom, a line at 50% white with the subtitle
 * (Montserrat 700 11, +1px, yellow) over the description (Inter 500 12, 80%) on the left and "Actualizado el ..."
 * (Space Grotesk 400 12, 80%; not loaded yet so Inter) on the right. The overlay is only what the CMS sends (none when
 * it is off). The description is the CMS inline HTML (links to the cities). The design draws no button: the CMS `cta`
 * is shown under the title with provisional styles, and `tall` has a provisional height.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function Banner({ data, lang }) {
	const { modules } = await getDictionary(lang);
	const { heading, background } = data;
	if (!heading && !data.description && !data.cta) {
		return null;
	}
	const dark = data.theme === "dark";
	const image = background.image.desktop ?? background.image.mobile;
	const imageMobile = background.image.mobile ?? background.image.desktop;
	const overlay = image ? data.overlay : null;
	const description = data.description ? cleanHtml(data.description) : "";
	const Tag = heading?.level ?? "h1";
	const updated = data.updatedAt ? formatDate(data.updatedAt, lang) : "";
	const hasFooter = Boolean(heading?.subtitle || description || updated);
	const tone = dark ? "text-white" : "text-ink";
	return (
		<SectionFrame
			spacing={data.spacing}
			defaults={{}}
			backgroundColor={background.color || undefined}
			theme={data.theme}
			className={`relative overflow-hidden ${tone} ${data.width === "full" ? "" : "mx-auto max-w-[1280px]"}`}
		>
			{image ? <Image src={image.url} alt="" fill priority sizes="100vw" className="hidden object-cover md:block" /> : null}
			{imageMobile ? <Image src={imageMobile.url} alt="" fill priority sizes="100vw" className="object-cover md:hidden" /> : null}
			{overlay ? <div aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: colorVar(overlay.color) ?? "#000", opacity: overlay.opacity }} /> : null}
			<div className={`relative mx-auto flex w-full max-w-[1280px] flex-col justify-between gap-10 px-4 pb-6 pt-16 md:px-20 md:pb-8 md:pt-28 ${HEIGHTS[data.height]}`}>
				<div className="flex flex-col items-start gap-4">
					{heading?.eyebrow ? (
						<p className="rounded bg-yellow px-3.5 py-1.5 text-[11px]/[13px] font-bold uppercase tracking-[1px] text-black">{heading.eyebrow}</p>
					) : null}
					{heading?.text || heading?.secondaryText ? (
						<Tag className="font-display text-[2.5rem]/11 font-black uppercase tracking-[-1.5px] text-balance md:text-[56px]/16 md:tracking-[-2px]">
							{heading.text ? <span style={{ color: colorVar(heading.color) }}>{heading.text}</span> : null}
							{heading.text && heading.secondaryText ? " " : null}
							{heading.secondaryText ? <span style={{ color: colorVar(heading.secondaryColor) }}>{heading.secondaryText}</span> : null}
						</Tag>
					) : null}
					{data.cta ? (
						<SiteLink
							href={data.cta.href}
							external={data.cta.external}
							className={`mt-2 inline-flex h-10 cursor-pointer items-center px-5 text-sm/5 font-black uppercase tracking-[0.7px] transition ${BUTTONS[data.buttonVariant]}`}
						>
							{data.cta.label}
						</SiteLink>
					) : null}
				</div>
				{hasFooter ? (
					<div className={`flex flex-col gap-3 border-t pt-6 opacity-90 md:flex-row md:items-start md:justify-between md:gap-8 ${dark ? "border-white/50" : "border-ink/30"}`}>
						<div className="flex flex-col gap-2">
							{heading?.subtitle ? <p className="font-display text-[11px]/[13px] font-bold uppercase tracking-[1px] text-yellow">{heading.subtitle}</p> : null}
							{description ? (
								<div
									className="text-xs/[15px] font-medium opacity-80 [&_a]:cursor-pointer [&_a]:underline-offset-2 [&_a]:transition hover:[&_a]:underline [&_p]:m-0"
									dangerouslySetInnerHTML={{ __html: description }}
								/>
							) : null}
						</div>
						{updated ? <p className="text-xs/[15px] opacity-80 md:text-right">{modules.banner.updated.replace("{date}", updated)}</p> : null}
					</div>
				) : null}
			</div>
		</SectionFrame>
	);
}
