import { colorVar } from "@/lib/design-tokens";

/**
 * Section title (CMS `heading`): optional eyebrow pill, Montserrat 900 48/48, -0.05em, uppercase, optionally in two
 * parts with their own colors, plus a subtitle (Inter 600 14/20, +0.1em, uppercase, #737373). Colors are CMS color
 * slugs; without one the title is the brand black (white on dark sections). The tag is only semantics (`level`), never size.
 * The eyebrow is a small pill (Figma Category_Pill: radius 4, padding 6/12, Space Grotesk 700 12, +2px, uppercase; Space
 * Grotesk is not loaded yet so it falls back to Inter): `eyebrowColor` is its background and `eyebrowText` its text color.
 * `variant="split"` (Figma Macro Secciones): the subtitle goes to the right, bottom aligned with the title, in Inter 500
 * 12/18 +2px, dark red, right aligned (it stacks under the title on mobile).
 * @param {{
 *   heading: { eyebrow?: string, text: string, secondaryText: string, level: string, subtitle: string, color: string, secondaryColor: string } | null,
 *   dark?: boolean,
 *   eyebrowColor?: string,
 *   eyebrowText?: string,
 *   variant?: "stacked" | "split",
 * }} props
 */
export default function SectionHeading({ heading, dark = false, eyebrowColor = "var(--color-primary)", eyebrowText = "var(--color-white)", variant = "stacked" }) {
	if (!heading) {
		return null;
	}
	const Tag = heading.level;
	const base = dark ? "var(--color-white)" : "var(--color-macro-black)";
	const split = variant === "split";
	const subtitle = heading.subtitle ? (
		split ? (
			<p className="text-xs/[18px] font-medium uppercase tracking-[2px] text-burgundy md:max-w-[475px] md:text-right">{heading.subtitle}</p>
		) : (
			<p className="mt-1 text-sm/5 font-semibold uppercase tracking-[0.1em] text-muted">{heading.subtitle}</p>
		)
	) : null;
	return (
		<div className={split ? "flex min-w-0 flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8" : "min-w-0"}>
			<div className="min-w-0">
				{heading.eyebrow ? (
					<p
						className="mb-4 inline-block rounded px-3 py-1.5 text-xs/[15px] font-bold uppercase tracking-[2px]"
						style={{ backgroundColor: eyebrowColor, color: eyebrowText }}
					>
						{heading.eyebrow}
					</p>
				) : null}
				{heading.text || heading.secondaryText ? (
					<Tag className="font-display text-[2rem]/8 font-black uppercase tracking-[-0.05em] text-balance md:text-5xl/[48px]">
						{heading.text ? <span style={{ color: colorVar(heading.color) ?? base }}>{heading.text}</span> : null}
						{heading.text && heading.secondaryText ? " " : null}
						{heading.secondaryText ? <span style={{ color: colorVar(heading.secondaryColor) ?? base }}>{heading.secondaryText}</span> : null}
					</Tag>
				) : null}
				{split ? null : subtitle}
			</div>
			{split ? subtitle : null}
		</div>
	);
}
