"use client";

import { createContext, useContext } from "react";

const ScopedDictionaryContext = createContext({ dictionary: {}, locale: "en" });

export function ScopedDictionaryProvider({ dictionary, locale, children }) {
	return (
		<ScopedDictionaryContext.Provider
			value={{ dictionary: dictionary || {}, locale: locale || "en" }}
		>
			{children}
		</ScopedDictionaryContext.Provider>
	);
}

export function useScopedDictionary() {
	return useContext(ScopedDictionaryContext);
}

function isPlainObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
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

export function useDictionaryScope(scopePath) {
	const { dictionary = {}, locale } = useScopedDictionary();
	const scopeNode = scopePath ? getNestedValue(dictionary, scopePath) : dictionary;

	if (!isPlainObject(scopeNode)) {
		return { t: {}, locale };
	}

	if (isPlainObject(scopeNode.self)) {
		return { t: scopeNode.self, locale };
	}

	return { t: pickLeafMessages(scopeNode), locale };
}
