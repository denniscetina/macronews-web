import { colorVar, spacingVar } from "@/lib/design-tokens";

const SIDES = { top: "t", right: "r", bottom: "b", left: "l" };

/**
 * Outer box of a CMS section: applies the editor's margin/padding and background color.
 * Spacing is `default` (the component's own value from `defaults`), `none` or a `spacingSystem` token.
 * It becomes CSS variables read by `.section-box` (globals.css), which switches desktop/mobile with a media query.
 * @param {{
 *   as?: string,
 *   spacing: { margin: any, padding: any },
 *   defaults?: { margin?: any, padding?: any },
 *   backgroundColor?: string,
 *   theme?: "dark" | "light",
 *   className?: string,
 *   children: React.ReactNode,
 * } & Record<string, any>} props `defaults` has the same shape as `spacing` ({ desktop: { top }, mobile: { top } }) with CSS lengths
 */
export default function SectionFrame({ as: Tag = "section", spacing, defaults = {}, backgroundColor, theme, className = "", children, ...props }) {
	const style = {};
	for (const [kind, prefix] of [["margin", "m"], ["padding", "p"]]) {
		for (const [device, suffix] of [["desktop", "d"], ["mobile", "m"]]) {
			for (const [side, short] of Object.entries(SIDES)) {
				style[`--${prefix}-${short}-${suffix}`] = spacingVar(spacing?.[kind]?.[device]?.[side]) ?? defaults[kind]?.[device]?.[side] ?? "0";
			}
		}
	}
	const background = colorVar(backgroundColor);
	if (background) {
		style.backgroundColor = background;
	}
	return (
		<Tag data-theme={theme} className={`section-box ${className}`} style={style} {...props}>
			{children}
		</Tag>
	);
}
