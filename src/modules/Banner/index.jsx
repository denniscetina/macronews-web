import Image from "next/image";
import SectionFrame from "@/components/ui/SectionFrame";
import { colorVar } from "@/lib/design-tokens";
import { getDictionary } from "@/i18n";

/** Figma `Category Page > Hero`: 50% black over the photo when the CMS sends no overlay of its own. */
const DEFAULT_OVERLAY = { color: "", opacity: 0.5 };

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
 * (Space Grotesk 400 12, 80%; not loaded yet so Inter) on the right. The design draws no button: the CMS `cta` is not
 * shown until it is designed. Heights other than "compact" are unknown, so every height uses the compact one.
 * @param {{ data: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"], lang: string }} props
 */
export default async function Banner({ data, lang }) {
	const { modules } = await getDictionary(lang);
	const { heading, background } = data;
	if (!heading && !data.description) {
		return null;
	}
	const dark = data.theme === "dark";
	const image = background.image.desktop ?? background.image.mobile;
	const imageMobile = background.image.mobile ?? background.image.desktop;
	const overlay = data.overlay ?? (image ? DEFAULT_OVERLAY : null);
	const Tag = heading?.level ?? "h1";
	const updated = data.updatedAt ? formatDate(data.updatedAt, lang) : "";
	const hasFooter = Boolean(heading?.subtitle || data.description || updated);
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
			<div className="relative mx-auto flex min-h-[320px] w-full max-w-[1280px] flex-col justify-between gap-10 px-4 pb-6 pt-16 md:min-h-[418px] md:px-20 md:pb-8 md:pt-28">
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
				</div>
				{hasFooter ? (
					<div className={`flex flex-col gap-3 border-t pt-6 opacity-90 md:flex-row md:items-start md:justify-between md:gap-8 ${dark ? "border-white/50" : "border-ink/30"}`}>
						<div className="flex flex-col gap-2">
							{heading?.subtitle ? <p className="font-display text-[11px]/[13px] font-bold uppercase tracking-[1px] text-yellow">{heading.subtitle}</p> : null}
							{data.description ? <p className="text-xs/[15px] font-medium opacity-80">{data.description}</p> : null}
						</div>
						{updated ? <p className="text-xs/[15px] opacity-80 md:text-right">{modules.banner.updated.replace("{date}", updated)}</p> : null}
					</div>
				) : null}
			</div>
		</SectionFrame>
	);
}
