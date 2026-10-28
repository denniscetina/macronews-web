import { colorVar } from "@/lib/design-tokens";

/**
 * Section title (CMS `heading`): Montserrat 900 48/48, -0.05em, uppercase, optionally in two parts with their own
 * colors, plus a subtitle (Inter 600 14/20, +0.1em, uppercase, #737373). Colors are CMS color slugs; without one
 * the title is the brand black (white on dark sections). The tag is only semantics (`level`), never size.
 * @param {{ heading: { text: string, secondaryText: string, level: string, subtitle: string, color: string, secondaryColor: string } | null, dark?: boolean }} props
 */
export default function SectionHeading({ heading, dark = false }) {
	if (!heading) {
		return null;
	}
	const Tag = heading.level;
	const base = dark ? "var(--color-white)" : "var(--color-macro-black)";
	return (
		<div className="min-w-0">
			<Tag className="font-display text-[2rem]/8 font-black uppercase tracking-[-0.05em] text-balance md:text-5xl/[48px]">
				{heading.text ? <span style={{ color: colorVar(heading.color) ?? base }}>{heading.text}</span> : null}
				{heading.text && heading.secondaryText ? " " : null}
				{heading.secondaryText ? <span style={{ color: colorVar(heading.secondaryColor) ?? base }}>{heading.secondaryText}</span> : null}
			</Tag>
			{heading.subtitle ? <p className="mt-1 text-sm/5 font-semibold uppercase tracking-[0.1em] text-muted">{heading.subtitle}</p> : null}
		</div>
	);
}
