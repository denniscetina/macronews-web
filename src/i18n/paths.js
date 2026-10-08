import { DEFAULT_LOCALE } from "@/config/site";

/** Prefix a path with its locale: the default locale has no prefix. */
export function localizePath(lang, path = "/") {
	const clean = path.startsWith("/") ? path : `/${path}`;
	if (lang === DEFAULT_LOCALE) {
		return clean;
	}
	return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}
