const META_TAG_PATTERN = /<meta\b[^>]*\/?>/gi;
const ATTRIBUTE_PATTERN =
	/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function normalizeScripts(scripts) {
	return Array.isArray(scripts)
		? scripts.filter((script) => script && typeof script === 'object')
		: [];
}

function sortScriptsByPriority(scripts) {
	return [...normalizeScripts(scripts)].sort((a, b) => {
		const priorityA = Number.isFinite(Number(a?.priority)) ? Number(a.priority) : 0;
		const priorityB = Number.isFinite(Number(b?.priority)) ? Number(b.priority) : 0;

		if (priorityA !== priorityB) {
			return priorityA - priorityB;
		}

		return Number(a?.id || 0) - Number(b?.id || 0);
	});
}

function parseAttributes(html) {
	const attributes = {};
	const source = String(html || '').replace(/^<\w+\b|\s*\/?>$/g, '');
	let match;

	ATTRIBUTE_PATTERN.lastIndex = 0;

	while ((match = ATTRIBUTE_PATTERN.exec(source)) !== null) {
		const [, rawName, doubleQuoted, singleQuoted, unquoted] = match;
		const name = rawName.toLowerCase();
		const value = doubleQuoted ?? singleQuoted ?? unquoted ?? '';

		attributes[name] = value;
	}

	return attributes;
}

function setMetadataOtherValue(other, name, content) {
	if (!name || typeof content !== 'string') {
		return;
	}

	const currentValue = other[name];

	if (typeof currentValue === 'undefined') {
		other[name] = content;
		return;
	}

	if (Array.isArray(currentValue)) {
		other[name] = [...currentValue, content];
		return;
	}

	other[name] = [currentValue, content];
}

function extractMetadataFromCode(code) {
	const other = {};
	const source = String(code || '');
	const metaTags = source.match(META_TAG_PATTERN) || [];

	for (const metaTag of metaTags) {
		const attributes = parseAttributes(metaTag);
		const name = attributes.name;
		const content = attributes.content;

		setMetadataOtherValue(other, name, content);
	}

	return other;
}

function stripMetaTags(code) {
	return String(code || '').replace(META_TAG_PATTERN, '').trim();
}

export function resolveHeadInjection(scripts) {
	const other = {};
	const clientScripts = [];

	for (const script of sortScriptsByPriority(scripts)) {
		const code = String(script?.code || '');
		const metadata = extractMetadataFromCode(code);

		for (const [name, content] of Object.entries(metadata)) {
			setMetadataOtherValue(other, name, content);
		}

		const remainingCode = stripMetaTags(code);

		if (remainingCode) {
			clientScripts.push({
				...script,
				code: remainingCode,
			});
		}
	}

	return {
		metadata: {
			other,
		},
		clientScripts,
	};
}

export function resolveBodyInjection(scripts) {
	return sortScriptsByPriority(scripts).filter((script) =>
		String(script?.code || '').trim(),
	);
}
