/**
 * Maps the `ArticleTemplate` of a news post (`post.sections[0]` of `GET /blog/{slug}`, core `.docs/Features/PostSections`): the
 * post data (format, source, reading time, location, summary...) and the ordered `content.blocks` of its body.
 * Components never read the raw shape. Blocks of an unknown `type` are dropped, as the core asks.
 */
import { mapImage } from "./media";
import { resolveHref } from "./links";
import { mapAdSlot, mapCardMeta, mapNewsItem, mapSpacing } from "./sections";

const text = (value) => (typeof value === "string" ? value.trim() : "");
const asObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const asArray = (value) => (Array.isArray(value) ? value : []);
const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

const mapTerm = (term) => ({ id: term?.id, name: text(term?.name), slug: text(term?.slug) });

/** Image with its caption (gallery photos and media). */
const mapCaptioned = (raw) => {
	const image = mapImage(raw);
	return image ? { ...image, caption: text(raw?.caption) } : null;
};

/** `Media` video: an own file (`src`), or a YouTube / Vimeo player (`embedUrl`). */
function mapVideo(raw) {
	const video = asObject(raw);
	const src = text(video.src);
	const embedUrl = text(video.embedUrl);
	if (!src && !embedUrl) {
		return null;
	}
	return { provider: text(video.provider), src: src || null, mimeType: text(video.mimeType) || null, embedUrl: embedUrl || null, poster: mapImage(video.poster) };
}

const BLOCKS = {
	RichText: (data) => (text(data.html) ? { html: text(data.html) } : null),
	Media: (data) => {
		const isVideo = data.mediaType === "video";
		const image = asObject(data.image);
		const desktop = mapCaptioned(image.desktop);
		const mobile = mapCaptioned(image.mobile);
		const video = isVideo ? mapVideo(data.video) : null;
		if (isVideo ? !video : !desktop && !mobile) {
			return null;
		}
		return { mediaType: isVideo ? "video" : "image", image: { desktop: desktop ?? mobile, mobile: mobile ?? desktop }, video, caption: text(data.caption), credit: text(data.credit) };
	},
	Gallery: (data) => {
		const images = asArray(data.images).map(mapCaptioned).filter(Boolean);
		return images.length > 0 ? { layoutVariant: oneOf(data.layoutVariant, ["carousel", "grid"], "carousel"), title: text(data.title), credit: text(data.credit), images } : null;
	},
	Quote: (data) => (text(data.text) ? { title: text(data.title), text: text(data.text), author: text(data.author), authorRole: text(data.authorRole) } : null),
	RelatedPost: (data) => {
		const item = mapNewsItem(data.item);
		return item.title ? { eyebrow: text(data.eyebrow), meta: mapCardMeta(data.meta), item } : null;
	},
	Embed: (data) => {
		const { href } = resolveHref(data.url);
		return href && /^https:\/\//i.test(href) ? { provider: oneOf(data.provider, ["x", "instagram", "tiktok", "facebook", "youtube", "vimeo"], ""), url: href, caption: text(data.caption) } : null;
	},
	AdSlot: (data) => {
		const ads = mapAdSlot(data.ads);
		return ads ? { ads } : null;
	},
	CustomHtmlBlock: (data) => {
		if (data.enabled === false || !text(data.html)) {
			return null;
		}
		const layout = asObject(data.layout);
		return {
			scopeId: text(data.scopeId),
			html: String(data.html),
			css: String(data.css ?? ""),
			cssClasses: text(data.cssClasses),
			htmlElement: oneOf(layout.htmlElement, ["section", "div", "article", "aside", "figure"], "div"),
			containerWidth: layout.containerWidth === "full_width" ? "full_width" : "contained",
			visibleOn: asArray(data.visibleOn).filter((device) => typeof device === "string"),
			spacing: mapSpacing(data.spacing),
		};
	},
};

/** @param {unknown} raw `content.blocks` */
export function mapArticleBlocks(raw) {
	return asArray(raw).flatMap((block) => {
		const map = BLOCKS[block?.type];
		const data = map ? map(asObject(block?.data)) : null;
		return data ? [{ type: block.type, data }] : [];
	});
}

/**
 * @param {any} post `post` of `/blog/:slug`
 * @param {{ title: string, excerpt: string, image: any, author: { id: any, name: string }, publishedAt: string, modifiedAt: string, categories: any[], tags: any[] }} legacy The post data read from the top level of `post`
 */
export function mapArticle(post, legacy) {
	const template = asArray(post.sections).find((section) => section?.type === "ArticleTemplate");
	const data = asObject(template?.data);
	const hasTemplate = Boolean(template);
	const categories = hasTemplate ? asArray(data.categories).map(mapTerm) : legacy.categories;
	const primary = data.primaryCategory ? mapTerm(data.primaryCategory) : null;
	return {
		format: data.format === "reel" || post.format === "reel" ? "reel" : "standard",
		source: data.source === "sections" ? "sections" : "legacy",
		title: text(data.title) || legacy.title,
		excerpt: text(data.excerpt) || text(legacy.excerpt) || null,
		image: mapImage(data.featuredImage) ?? legacy.image,
		category: (primary?.name ? primary : null) ?? categories[0] ?? null,
		tags: hasTemplate ? asArray(data.tags).map(mapTerm) : legacy.tags,
		location: text(data.location) || null,
		author: hasTemplate && data.author ? { id: data.author.id, name: text(data.author.name) } : legacy.author,
		publishedAt: text(data.date) || legacy.publishedAt,
		modifiedAt: text(data.modified) || legacy.modifiedAt,
		readingTime: Number.isFinite(Number(data.readingTime)) && Number(data.readingTime) > 0 ? Number(data.readingTime) : null,
		// "Resumen en 30 segundos": the core sends `[]` in production, so nothing is painted there.
		summary: asArray(data.summary).map(text).filter(Boolean),
		reel: data.reel ?? post.reel ?? null,
		// Without a template (an older API) the body is the legacy HTML.
		blocks: hasTemplate ? mapArticleBlocks(asObject(data.content).blocks) : text(post.content) ? [{ type: "RichText", data: { html: post.content } }] : [],
	};
}
