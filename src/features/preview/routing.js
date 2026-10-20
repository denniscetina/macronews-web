import { DEFAULT_LOCALE, LOCALES } from "@/config/site";
import { localizePath } from "@/i18n/paths";

export const PREVIEW_VIEWPORTS = {
	desktop: { label: "Desktop", width: null },
	tablet: { label: "Tablet", width: 768 },
	mobile: { label: "Mobile", width: 390 },
};

/** Split a slug into clean segments and drop any "preview" segment. */
export function cleanPreviewSegments(slug) {
	return String(slug ?? "")
		.split(/[?#]/)[0]
		.split("/")
		.map((segment) => segment.trim())
		.filter((segment) => segment && segment !== "preview");
}

/**
 * "/preview/es/about" slug segments -> public path "/es/about" (default locale has no prefix).
 * The front page lives at the root of its language, not at its slug.
 * @param {string[]} segments
 * @param {Record<string, { slug?: string }>} [frontPages] `frontPages` of the site payload, by language
 */
export function resolvePreviewTargetPath(segments = [], frontPages = {}) {
	const clean = segments.filter(Boolean);
	const lang = LOCALES.includes(clean[0]) ? clean[0] : DEFAULT_LOCALE;
	const rest = LOCALES.includes(clean[0]) ? clean.slice(1) : clean;
	const isFrontPage = rest.length === 1 && rest[0] === frontPages?.[lang]?.slug;
	return localizePath(lang, rest.length && !isFrontPage ? `/${rest.join("/")}` : "/");
}

export function resolvePreviewViewport(viewport) {
	return Object.hasOwn(PREVIEW_VIEWPORTS, viewport) ? viewport : "desktop";
}

export function buildPreviewViewportHref(segments, viewport) {
	const base = segments.length ? `/preview/${segments.join("/")}` : "/preview";
	return viewport === "desktop" ? base : `${base}?vp=${viewport}`;
}

export function buildPreviewIframeSrc(targetPath) {
	const url = new URL(targetPath || "/", "http://preview.local");
	return `${url.pathname}${url.search}`;
}
