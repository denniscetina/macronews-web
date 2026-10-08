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

/** "/preview/es/about" slug segments -> public path "/es/about" (default locale has no prefix). */
export function resolvePreviewTargetPath(segments = []) {
	const clean = segments.filter(Boolean);
	const lang = LOCALES.includes(clean[0]) ? clean[0] : DEFAULT_LOCALE;
	const rest = LOCALES.includes(clean[0]) ? clean.slice(1) : clean;
	return localizePath(lang, rest.length ? `/${rest.join("/")}` : "/");
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
	url.searchParams.set("previewFrame", "1");
	return `${url.pathname}${url.search}`;
}
