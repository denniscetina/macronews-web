import "server-only";
import { cache } from "react";

const dictionaries = {
	es: () => import("./es.json").then((module) => module.default),
	en: () => import("./en.json").then((module) => module.default),
};

const DEFAULT_LOCALE = "en";

function isPlainObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeLocale(locale) {
	if (!locale || typeof locale !== "string") {
		return DEFAULT_LOCALE;
	}

	return locale.toLowerCase().split("-")[0] || DEFAULT_LOCALE;
}

export async function getDictionary(locale) {
	const normalizedLocale = normalizeLocale(locale);
	const dictionaryResolver = dictionaries[normalizedLocale] || dictionaries.en;
	return dictionaryResolver();
}

const getCachedDictionary = cache(async (locale) => {
	const normalizedLocale = normalizeLocale(locale);

	try {
		const dictionary = await getDictionary(normalizedLocale);
		return isPlainObject(dictionary) ? dictionary : {};
	} catch (error) {
		if (normalizedLocale === DEFAULT_LOCALE) {
			console.warn("[i18n] Failed to load default dictionary", error);
			return {};
		}
	}

	try {
		const fallbackDictionary = await getDictionary(DEFAULT_LOCALE);
		return isPlainObject(fallbackDictionary) ? fallbackDictionary : {};
	} catch (error) {
		console.warn("[i18n] Failed to load fallback dictionary", error);
		return {};
	}
});

export async function getDictionarySafe(locale) {
	return getCachedDictionary(locale);
}

export function pickTypeDictionary(dictionary = {}, type) {
	if (!type || !isPlainObject(dictionary)) {
		return {};
	}

	const selectedType = dictionary[type];
	return isPlainObject(selectedType) ? selectedType : {};
}

function getNestedValue(source, key) {
	if (!key || typeof key !== "string") {
		return undefined;
	}

	return key.split(".").reduce((accumulator, segment) => {
		if (!accumulator || typeof accumulator !== "object") {
			return undefined;
		}

		return accumulator[segment];
	}, source);
}

function pickLeafMessages(node = {}) {
	if (!isPlainObject(node)) {
		return {};
	}

	return Object.fromEntries(
		Object.entries(node).filter(([, value]) => {
			if (value === false || value === null || value === undefined) {
				return false;
			}

			return !isPlainObject(value) && !Array.isArray(value);
		}),
	);
}

export function pickComponentNode({ dictionary = {}, type, componentPath }) {
	const typeDictionary = pickTypeDictionary(dictionary, type);

	if (!componentPath) {
		return typeDictionary;
	}

	const selectedNode = getNestedValue(typeDictionary, componentPath);
	return isPlainObject(selectedNode) ? selectedNode : {};
}

export function pickComponentMessages({ dictionary = {}, type, componentPath }) {
	const selectedNode = pickComponentNode({ dictionary, type, componentPath });

	if (isPlainObject(selectedNode?.self)) {
		return selectedNode.self;
	}

	return pickLeafMessages(selectedNode);
}

// Backward-compatible alias used while migrating ModuleRenderer integration.
export function resolveModuleDictionary({
	dictionary = {},
	type = "modules",
	componentPath,
}) {
	return pickComponentMessages({ dictionary, type, componentPath });
}

export function createTranslator(messages = {}) {
	return function t(key, fallback = "") {
		const value = getNestedValue(messages, key);

		if (value === undefined || value === null || value === false) {
			return fallback || key;
		}

		return String(value);
	};
}
