/**
 * CMS "Site Scripts": fragments of HTML/JS an editor places in `head`, `bodyStart` or `bodyEnd`.
 * They come from the CMS admin (trusted), are ordered by `priority` then `id`, and rendered as-is.
 */
const META_TAG = /<meta\b[^>]*\/?>/gi;
const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

const sortScripts = (scripts) =>
	[...scripts].sort((a, b) => num(a.priority) - num(b.priority) || num(a.id) - num(b.id));

function parseAttributes(tag) {
	const attributes = {};
	const source = tag.replace(/^<\w+\b|\s*\/?>$/g, "");
	for (const [, name, double, single, bare] of source.matchAll(ATTRIBUTE)) {
		attributes[name.toLowerCase()] = double ?? single ?? bare ?? "";
	}
	return attributes;
}

/**
 * Head scripts: `<meta name=...>` tags become Next metadata (so they are not duplicated and are
 * rendered server-side); the remaining code is returned to be injected in the browser.
 * @param {Array<{ code?: string, [key: string]: any }>} scripts
 * @returns {{ other: Record<string, string | string[]>, clientScripts: any[] }}
 */
export function resolveHeadInjection(scripts = []) {
	const other = {};
	const clientScripts = [];
	for (const script of sortScripts(scripts)) {
		const code = String(script.code ?? "");
		for (const tag of code.match(META_TAG) ?? []) {
			const { name, content } = parseAttributes(tag);
			if (name && typeof content === "string") {
				other[name] = other[name] === undefined ? content : [other[name]].flat().concat(content);
			}
		}
		const rest = code.replace(META_TAG, "").trim();
		if (rest) {
			clientScripts.push({ ...script, code: rest });
		}
	}
	return { other, clientScripts };
}

/** @param {Array<{ code?: string }>} scripts */
export const resolveBodyInjection = (scripts = []) => sortScripts(scripts).filter((script) => String(script.code ?? "").trim());
