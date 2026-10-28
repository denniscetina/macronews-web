const SLUG = /^[a-z0-9][a-z0-9_-]*$/;
// Values end up inside a <style> tag: allow only plain colors / font names, nothing that can close a rule or a tag.
const SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s/-]+$/;
const SAFE_FONT = /^[\w\s-]+$/;

/**
 * Token slug as the CSS variable suffix. The CMS stores some slugs with a CSS-variable look ("--macro-red"),
 * so leading dashes are dropped: "--macro-red" and "macro-red" are the same token.
 * Section components receive slugs in that same stored form, so they must go through here too.
 * @param {unknown} slug
 * @returns {string} "" when it is not a valid slug
 */
export function tokenSlug(slug) {
	const value = String(slug ?? "").trim().replace(/^-+/, "").toLowerCase();
	return SLUG.test(value) ? value : "";
}

/**
 * `var(--color-<slug>)` for a CMS color slug (inline styles of section components), or undefined.
 * @param {unknown} slug
 */
export function colorVar(slug) {
	const value = tokenSlug(slug);
	return value ? `var(--color-${value})` : undefined;
}

/**
 * Value of a CMS spacing side: "default" (the component's own spacing) and "none" (0) are reserved words,
 * anything else is a `spacingSystem` slug. Returns undefined for "default" or an unknown value.
 * @param {unknown} side
 */
export function spacingVar(side) {
	if (side === "none") {
		return "0";
	}
	const value = tokenSlug(side);
	return value && value !== "default" ? `var(--space-${value})` : undefined;
}

/**
 * CSS variables from the CMS design tokens (Site Settings > Advanced > Design Tokens).
 * Each one overrides the default declared in globals.css (`@theme`) with the same name, so the Tailwind
 * utilities (`bg-macro-red`, `font-brand`) and `var(--space-md)` follow the CMS without a rebuild.
 * @param {{
 *   colors: Array<{slug: string, value: string}>,
 *   fonts: Array<{slug: string, family: string, fallback: string}>,
 *   spacing: Array<{slug: string, value: number}>,
 * }} design
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
		...design.spacing
			.filter((space) => SLUG.test(space.slug) && Number.isFinite(space.value) && space.value >= 0)
			.map((space) => `--space-${space.slug}:${space.value}rem;`),
	];
	return rules.length ? `:root{${rules.join("")}}` : "";
}
