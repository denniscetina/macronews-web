import "server-only";

function isPlainObject(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}

function hasValidGraph(value) {
	return (
		Array.isArray(value) &&
		value.some((entry) => isPlainObject(entry))
	);
}

function isValidSchemaEntry(entry) {
	if (!isPlainObject(entry)) {
		return false;
	}

	return (
		isNonEmptyString(entry["@type"]) ||
		hasValidGraph(entry["@graph"])
	);
}

export function normalizeSchemas(rawSchemas) {
	const source = Array.isArray(rawSchemas)
		? rawSchemas
		: isPlainObject(rawSchemas)
			? [rawSchemas]
			: [];

	return source.filter(isValidSchemaEntry);
}

export function serializeSchema(schema) {
	return JSON.stringify(schema)
		.replace(/</g, "\\u003c")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}
