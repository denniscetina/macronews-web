import "server-only";
import { DEFAULT_LOCALE, isLocale } from "@/config/site";

const loaders = {
	es: () => import("./dictionaries/es.json").then((m) => m.default),
};

/**
 * The only i18n entry point. Falls back to the default locale for unknown languages.
 * @param {string} lang
 */
export async function getDictionary(lang) {
	return loaders[isLocale(lang) ? lang : DEFAULT_LOCALE]();
}

export { localizePath } from "./paths";
