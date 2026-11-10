import "server-only";
import sanitizeHtml from "sanitize-html";
import { resolveHref } from "@/server/cms/mappers/links";

/** Hosts whose players may be embedded in a post (the rest of the iframes are dropped). */
const EMBED_HOSTS = ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"];

const OPTIONS = {
	allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "sub", "sup", "a", "ul", "ol", "li", "blockquote", "hr", "img", "figure", "figcaption", "span", "div", "table", "thead", "tbody", "tr", "th", "td", "iframe"],
	allowedAttributes: {
		a: ["href", "target", "rel", "title"],
		img: ["src", "srcset", "sizes", "alt", "width", "height", "loading", "decoding"],
		iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "loading"],
		th: ["colspan", "rowspan"],
		td: ["colspan", "rowspan"],
	},
	allowedSchemes: ["http", "https", "mailto", "tel"],
	allowedSchemesByTag: { img: ["http", "https"], iframe: ["https"] },
	allowedIframeHostnames: EMBED_HOSTS,
	// An empty paragraph is only spacing the editor typed; an image or player left without a source is a blank box.
	exclusiveFilter: (frame) => ((frame.tag === "iframe" || frame.tag === "img") && !frame.attribs.src) || (frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren?.length),
};

/**
 * Cleans the HTML body of a post (the CMS sends it as the editor wrote it, pasted text included): keeps the
 * elements of an article, drops scripts, event handlers, styles, classes and players that are not YouTube or Vimeo,
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
