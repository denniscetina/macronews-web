export function isPlainObject(value) {
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

export function createTranslator(messages = {}) {
	return function t(key, fallback = "") {
		const value = getNestedValue(messages, key);

		if (value === undefined || value === null || value === false) {
			return fallback || key;
		}

		return String(value);
	};
}

export function deepMergeDict(base, override) {
	if (!isPlainObject(base)) {
		return isPlainObject(override) ? { ...override } : override ?? {};
	}

	if (!isPlainObject(override)) {
		return override === undefined ? { ...base } : override;
	}

	const result = { ...base };

	for (const key of Object.keys(override)) {
		const baseValue = base[key];
		const overrideValue = override[key];

		if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
			result[key] = deepMergeDict(baseValue, overrideValue);
			continue;
		}

		if (overrideValue !== undefined) {
			result[key] = overrideValue;
		}
	}

	return result;
}
