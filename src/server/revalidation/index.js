import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { DEFAULT_LOCALE, LOCALES } from "@/config/site";
import { localizePath } from "@/i18n";
import { tags as cacheTags } from "@/server/cms/tags";

/** Accepts a value or array, comma separated strings included, and returns clean strings. */
function toList(...values) {
	return values
		.flatMap((value) => (Array.isArray(value) ? value : [value]))
		.flatMap((value) => String(value ?? "").split(","))
		.map((value) => value.trim())
		.filter(Boolean);
}

const trimSlashes = (value) => String(value ?? "").split(/[?#]/)[0].replace(/^\/+|\/+$/g, "");

/**
 * Both URL forms of a page are cached: the public one (default locale without prefix)
 * and the internal one (always prefixed), so both are invalidated.
 * @param {string} path Public or internal path, e.g. "/about" or "/en/about"
 * @param {string} [lang] Used when the path has no locale prefix
 */
function expandPath(path, lang) {
	const segments = trimSlashes(path).split("/").filter(Boolean);
	const hasLocale = LOCALES.includes(segments[0]);
	const resolvedLang = hasLocale ? segments[0] : lang || DEFAULT_LOCALE;
	const rest = `/${(hasLocale ? segments.slice(1) : segments).join("/")}`;

	return [localizePath(resolvedLang, rest), `/${resolvedLang}${rest === "/" ? "" : rest}`];
}

/**
 * Turn a request into the cache tags and paths to invalidate.
 * Contract (used by the CMS): target ("layout"|"site"), lang, slug/slugs, path/paths, tags.
 * @param {{ target?: string, lang?: string, slug?: any, slugs?: any, path?: any, paths?: any, tags?: any }} input
 * @returns {{ tags: string[], paths: string[] } | null} null when there is nothing valid to invalidate
 */
export function resolveRevalidation(input = {}) {
	const target = String(input.target ?? "").trim().toLowerCase();
	const lang = String(input.lang ?? "").trim().replace(/^\/+|\/+$/g, "");
	const tags = new Set(toList(input.tags));
	const paths = new Set();

	if (target === "layout" || target === "site") {
		tags.add(cacheTags.site);
	} else if (target) {
		return null;
	}

	for (const path of toList(input.path, input.paths)) {
		expandPath(path, lang).forEach((value) => paths.add(value));
	}

	const slugs = toList(input.slug, input.slugs);
	if (slugs.length === 0 && lang && !target && tags.size === 0 && paths.size === 0) {
		slugs.push(""); // only a language: invalidate its home page
	}
	for (const slug of slugs) {
		expandPath(slug, lang).forEach((value) => paths.add(value));
	}

	return tags.size || paths.size ? { tags: [...tags], paths: [...paths] } : null;
}

/** @param {{ tags: string[], paths: string[] }} targets */
export function revalidateContent({ tags, paths }) {
	for (const tag of tags) {
		revalidateTag(tag, "max");
	}
	for (const path of paths) {
		revalidatePath(path);
	}
	return { tags, paths };
}
