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
