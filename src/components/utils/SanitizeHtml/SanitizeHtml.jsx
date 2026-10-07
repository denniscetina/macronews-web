const sanitizeServerHtml = (rawHtml) =>
	rawHtml
		.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
		.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
		//.replace(/\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
		.replace(/\s(?:src|href)\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*'|\s*javascript:[^\s>]+)/gi, "");

export const sanitizeHtml = (html) => {
	const safeHtml = html || "";
	//return sanitizeServerHtml(safeHtml);
	return safeHtml;
};

const TITLE_ALLOWED_TAGS = new Set(["br", "strong", "b", "em", "i", "sup", "sub"]);

const escapeHtml = (value) =>
	value
		.replace(/&(?!#\d+;|#x[\da-f]+;|[a-z][a-z0-9]+;)/gi, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

export const sanitizeTitleHtml = (html) => {
	const safeHtml = sanitizeServerHtml(String(html || ""));

	return safeHtml.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>|[^<]+|</gi, (token, tagName) => {
		if (!tagName) {
			return escapeHtml(token);
		}

		const normalizedTag = tagName.toLowerCase();

		if (!TITLE_ALLOWED_TAGS.has(normalizedTag)) {
			return "";
		}

		if (normalizedTag === "br") {
			return "<br>";
		}

		return token.startsWith("</") ? `</${normalizedTag}>` : `<${normalizedTag}>`;
	});
};
