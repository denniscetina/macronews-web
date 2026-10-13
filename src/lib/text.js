const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”" };

/**
 * Decodes the HTML entities WordPress/Yoast leave in plain-text fields (`&#8217;`, `&amp;`...).
 * React and Next escape text themselves, so un-decoded entities would be shown literally.
 * @param {string | null | undefined} value
 */
export function decodeEntities(value) {
	return String(value ?? "").replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
		if (entity[0] === "#") {
			const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
			return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
		}
		return NAMED[entity.toLowerCase()] ?? match;
	});
}
