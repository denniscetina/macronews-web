import "server-only";
import sanitizeHtml from "sanitize-html";
import { resolveHref } from "@/server/cms/mappers/links";

/** Hosts whose players may be embedded in a post (the rest of the iframes are dropped). */
const EMBED_HOSTS = ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"];

/** A plain CSS color: hex, `rgb()` / `rgba()` / `hsl()` / `hsla()` with numbers only, or a color name. No `url()`, `var()` or `expression()`. */
const CSS_COLOR = /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/-]+\)|[a-z]{3,30})$/i;

const OPTIONS = {
	allowedTags: ["p", "br", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "sub", "sup", "a", "ul", "ol", "li", "blockquote", "hr", "img", "figure", "figcaption", "span", "div", "table", "thead", "tbody", "tr", "th", "td", "iframe"],
	// Core decision 7 (Post Sections): `h1` and, in `style`, only the text color, the background color and the alignment the editor
	// chose; every other declaration, `class` and the rest of the attributes are still dropped.
	allowedAttributes: {
		p: ["style"],
		h1: ["style"],
		h2: ["style"],
		h3: ["style"],
		h4: ["style"],
		span: ["style"],
		div: ["style"],
		li: ["style"],
		blockquote: ["style"],
		a: ["href", "target", "rel", "title", "style"],
		img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"],
		iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "loading"],
		th: ["colspan", "rowspan"],
		td: ["colspan", "rowspan"],
	},
	allowedStyles: {
		"*": {
			color: [CSS_COLOR],
			"background-color": [CSS_COLOR],
			"text-align": [/^(left|right|center|justify)$/],
		},
	},
	allowedSchemes: ["http", "https", "mailto", "tel"],
	allowedSchemesByTag: { img: ["http", "https"], iframe: ["https"] },
	allowedIframeHostnames: EMBED_HOSTS,
	// An empty paragraph is only spacing the editor typed; an image or player left without a source is a blank box.
	exclusiveFilter: (frame) => ((frame.tag === "iframe" || frame.tag === "img") && !frame.attribs.src) || (frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren?.length),
};

/**
 * Cleans the HTML of a post `RichText` block (the CMS sends it as the editor wrote it, pasted text included): keeps the
 * elements of an article, drops scripts, event handlers, classes and every style but color, background color and alignment, and players that are not YouTube or Vimeo,
 * sends links to this site as paths and makes the external ones open in a new tab. Images load lazily.
 * @param {string} html
 * @param {string[]} origins Origins of this site and of the CMS (see `originOf`)
 */
export function cleanHtml(html, origins = []) {
	return sanitizeHtml(String(html ?? ""), {
		...OPTIONS,
		transformTags: {
			a: (tagName, attribs) => {
				const { href, external } = resolveHref(attribs.href, origins);
				// Only paths and the schemes of `allowedSchemes` are links; anything else ("javascript:") is plain text.
				if (!href || !/^(\/|https?:|mailto:|tel:)/i.test(href)) {
					return { tagName: "span", attribs: {} };
				}
				return { tagName, attribs: external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href } };
			},
			img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
		},
	});
}
