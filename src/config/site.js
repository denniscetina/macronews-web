/**
 * Static site configuration (no secrets). Edit here when adding a language.
 */
export const LOCALES = ["es", "en"];
export const DEFAULT_LOCALE = "es";

export const SITE_NAME = "Macronews";

/** @param {string} lang */
export function isLocale(lang) {
	return LOCALES.includes(lang);
}
