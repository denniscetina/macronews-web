/**
 * Static site configuration (no secrets). Edit here when adding a language.
 * Only Spanish is enabled for now; routing, services and cache tags are already per-language,
 * so adding one is: append it here + a dictionary and loader in `src/i18n` (see README).
 */
export const LOCALES = ["es"];
export const DEFAULT_LOCALE = "es";

export const SITE_NAME = "Macronews";

/** @param {string} lang */
export function isLocale(lang) {
	return LOCALES.includes(lang);
}

/**
 * Whether the archive pages of a category, a location or a tag (`/categoria/{slug}`, `/ubicacion/...`, `/tema/{slug}`)
 * exist in the front. They do not yet (the CMS has no endpoint for their news, see README "categorías y archivos"), so
 * the menu items that point to them are left out instead of leading to a 404. Turn it on when the pages are built.
 */
export const ARCHIVE_PAGES = false;
