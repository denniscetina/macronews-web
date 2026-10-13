const SLUG = /^[a-z0-9-]+$/;
// Values end up inside a <style> tag: allow only plain colors / font names, nothing that can close a rule or a tag.
const SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s/-]+$/;
const SAFE_FONT = /^[\w\s-]+$/;

/**
 * CSS variables from the CMS design tokens (Site Settings > Advanced).
 * `--color-<slug>` and `--font-<slug>` override the Tailwind theme defaults in globals.css,
 * so a color with slug "primary" repaints `bg-primary`, `text-primary`, etc.
 * @param {{ colors: Array<{slug: string, value: string}>, fonts: Array<{slug: string, family: string, fallback: string}> }} design
 * @returns {string} CSS text, empty when the CMS has no tokens
 */
export function designTokensCss(design) {
	const rules = [
		...design.colors
			.filter((color) => SLUG.test(color.slug) && SAFE_COLOR.test(color.value))
			.map((color) => `--color-${color.slug}:${color.value};`),
		...design.fonts
			.filter((font) => SLUG.test(font.slug) && SAFE_FONT.test(font.family) && SAFE_FONT.test(font.fallback))
			.map((font) => `--font-${font.slug}:"${font.family}",${font.fallback};`),
	];
	return rules.length ? `:root{${rules.join("")}}` : "";
}
