/**
 * Maps the page `sections` of the CMS (`{ type, data }`, contracts in macropress-core `.docs/Components`)
 * to the models of the section components. Components never read the raw payload.
 * Sections the editor switched off (`{ enabled: false }`) are dropped here.
 */
import { tokenSlug } from "@/lib/design-tokens";
import { decodeEntities } from "@/lib/text";
import { mapImage } from "./media";
import { resolveHref } from "./links";

// Plain-text fields of the CMS arrive with HTML entities (`&#8220;`): decoded once, here.
const text = (value) => (typeof value === "string" ? decodeEntities(value).trim() : "");
const asObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const asArray = (value) => (Array.isArray(value) ? value : []);
const bool = (value, fallback) => (typeof value === "boolean" ? value : fallback);
const number = (value, fallback) => (Number.isFinite(Number(value)) && value !== null && value !== "" ? Number(value) : fallback);
const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

const SIDES = ["top", "right", "bottom", "left"];

/** Color slugs reach the components already normalized ("--macro-red" -> "macro-red"), "" when empty. */
const colorSlug = (value) => tokenSlug(value);

/**
 * `{ url, title, target }` of an ACF link -> `{ href, external, label, target }`, null when the editor left it empty.
 * A button with text but a placeholder URL ("#") still shows: the editor already wrote the button, only the link is pending.
 */
function mapCta(raw) {
	const cta = asObject(raw);
	const label = text(cta.title);
	const { href, external } = resolveHref(cta.url);
	if (!href && !label) {
		return null;
	}
	return { href: href ?? "#", external, label, target: text(cta.target) || null };
}

function mapImagePair(raw) {
	const pair = asObject(raw);
	return { desktop: mapImage(pair.desktop), mobile: mapImage(pair.mobile) };
}

/** Margin/padding per side and device; each side is "default", "none" or a `spacingSystem` slug. */
function mapSpacing(raw) {
	const spacing = asObject(raw);
	const device = (box) =>
		Object.fromEntries(SIDES.map((side) => [side, text(box?.[side]) || "default"]));
	const kind = (value) => ({ desktop: device(asObject(value).desktop), mobile: device(asObject(value).mobile) });
	return { margin: kind(spacing.margin), padding: kind(spacing.padding) };
}

function mapHeroCarousel(data) {
	const background = asObject(data.background);
	return {
		slides: asArray(data.slides).map((slide) => ({
			kicker: text(slide?.kicker),
			title: text(slide?.title),
			description: text(slide?.description),
			cta: mapCta(slide?.cta),
			image: mapImagePair(slide?.image),
		})),
		theme: oneOf(data.theme, ["dark", "light"], "dark"),
		background: { color: colorSlug(background.color), image: mapImagePair(background.image) },
		navigation: {
			showArrows: bool(data.navigation?.showArrows, true),
			showPagination: bool(data.navigation?.showPagination, true),
		},
		playback: {
			touchEnabled: bool(data.playback?.touchEnabled, true),
			autoplay: bool(data.playback?.autoplay, true),
			autoplayInterval: Math.max(1000, number(data.playback?.autoplayInterval, 5000)),
		},
		spacing: mapSpacing(data.spacing),
	};
}

function mapMarquee(data) {
	const animation = asObject(data.animation);
	return {
		items: asArray(data.items)
			.map((item) => ({ text: text(item?.text), cta: mapCta(item?.cta) }))
			.filter((item) => item.text),
		// The CMS does not filter by date (the page is cached): the component evaluates it.
		schedule: { startAt: text(data.schedule?.startAt) || null, endAt: text(data.schedule?.endAt) || null },
		backgroundColor: colorSlug(data.backgroundColor),
		theme: oneOf(data.theme, ["dark", "light"], "dark"),
		fontWeight: oneOf(data.fontWeight, ["bold", "regular", "light"], "regular"),
		buttonVariant: oneOf(data.buttonVariant, ["default", "primary", "secondary", "outline", "link"], "default"),
		animation: {
			transition: oneOf(animation.transition, ["slide_horizontal", "slide_vertical", "marquee"], "slide_horizontal"),
			interval: Math.max(1000, number(animation.interval, 5000)),
			speed: Math.max(1, number(animation.speed, 60)),
			pauseOnHover: bool(animation.pauseOnHover, true),
		},
		spacing: mapSpacing(data.spacing),
	};
}

/** `heading` of SectionHeading (text, optional second part in another color, subtitle), null when empty. */
function mapHeading(raw) {
	const heading = asObject(raw);
	const mapped = {
		eyebrow: text(heading.eyebrow),
		text: text(heading.text),
		secondaryText: text(heading.secondaryText),
		level: oneOf(heading.level, ["h1", "h2", "h3", "h4", "h5", "h6"], "h2"),
		subtitle: text(heading.subtitle),
		color: colorSlug(heading.color),
		secondaryColor: colorSlug(heading.secondaryColor),
	};
	return mapped.eyebrow || mapped.text || mapped.secondaryText || mapped.subtitle ? mapped : null;
}

/**
 * A news item of NewsCarousel / the nearby endpoint. `image` is null for posts without a featured image.
 * @param {any} raw
 */
export function mapNewsItem(raw) {
	const item = asObject(raw);
	return {
		id: number(item.id, 0),
		url: text(item.url) || "#",
		kicker: text(item.kicker),
		title: text(item.title),
		excerpt: text(item.excerpt),
		image: mapImage(item.image),
		location: text(item.location),
		author: text(item.author),
		readingTime: number(item.readingTime, 0),
		publishedAt: text(item.publishedAt) || null,
	};
}

function mapNewsCarousel(data) {
	const notice = asObject(data.notice);
	const nearby = asObject(data.nearby);
	const params = asObject(nearby.params);
	return {
		heading: mapHeading(data.heading),
		items: asArray(data.items).map(mapNewsItem).filter((item) => item.title),
		// Items of the reader's location are asked at run time (see `/api/news/nearby`); only the query is kept.
		nearby: nearby.endpoint
			? {
					selectionCriteria: oneOf(params.selectionCriteria, ["latest", "featured", "random"], "latest"),
					postsLimit: Math.min(20, Math.max(1, number(params.postsLimit, 8))),
					categories: asArray(params.categories).map(Number).filter(Number.isInteger),
					tags: asArray(params.tags).map(Number).filter(Number.isInteger),
					dateRange: text(params.dateRange) || null,
					lang: text(params.lang) || null,
				}
			: null,
		notice: text(notice.message)
			? {
					icon: oneOf(notice.icon, ["alert", "info", "megaphone", "mail"], "alert"),
					title: text(notice.title),
					message: text(notice.message),
					cta: mapCta(notice.cta),
				}
			: null,
		backgroundColor: colorSlug(data.backgroundColor),
		theme: oneOf(data.theme, ["dark", "light"], "dark"),
		buttonVariant: oneOf(data.buttonVariant, ["default", "primary", "secondary", "outline", "link"], "default"),
		slidesPerView: {
			desktop: Math.min(6, Math.max(1, number(data.slidesPerView?.desktop, 4))),
			mobile: Math.min(3, Math.max(1, number(data.slidesPerView?.mobile, 1.2))),
		},
		navigation: {
			showArrows: bool(data.navigation?.showArrows, true),
			showPagination: bool(data.navigation?.showPagination, false),
		},
		playback: {
			touchEnabled: bool(data.playback?.touchEnabled, true),
			autoplay: bool(data.playback?.autoplay, false),
			autoplayInterval: Math.max(1000, number(data.playback?.autoplayInterval, 5000)),
			pauseOnHover: bool(data.playback?.pauseOnHover, true),
		},
		layoutVariant: oneOf(data.layoutVariant, ["compact", "cards", "list"], "compact"),
		showAds: bool(data.showAds, false),
		spacing: mapSpacing(data.spacing),
	};
}

function mapCategory(raw) {
	const category = asObject(raw);
	const { href } = resolveHref(category.url);
	return {
		id: number(category.id, 0),
		name: text(category.name),
		slug: text(category.slug),
		url: href,
		count: number(category.count, 0),
		posts: asArray(category.posts).map(mapNewsItem).filter((item) => item.title),
	};
}

function mapCategoriesBlock(data) {
	return {
		heading: mapHeading(data.heading),
		categories: asArray(data.categories).map(mapCategory).filter((category) => category.name),
		// `null` in the CMS: no "Ver todo" button.
		viewAllLabel: text(data.viewAllLabel),
		showNumbering: bool(data.showNumbering, false),
		showPosts: bool(data.showPosts, true),
		backgroundColor: colorSlug(data.backgroundColor),
		theme: oneOf(data.theme, ["dark", "light"], "dark"),
		navigation: {
			showArrows: bool(data.navigation?.showArrows, true),
			showPagination: bool(data.navigation?.showPagination, false),
		},
		playback: {
			touchEnabled: bool(data.playback?.touchEnabled, true),
			autoplay: bool(data.playback?.autoplay, false),
			autoplayInterval: Math.max(1000, number(data.playback?.autoplayInterval, 5000)),
			pauseOnHover: bool(data.playback?.pauseOnHover, true),
		},
		layoutVariant: "list",
		spacing: mapSpacing(data.spacing),
	};
}

function mapItemCollection(data) {
	return {
		heading: mapHeading(data.heading),
		items: asArray(data.items)
			.map((item) => ({
				title: text(item?.title),
				level: oneOf(item?.level, ["h1", "h2", "h3", "h4", "h5", "h6"], "h3"),
				description: text(item?.description),
				cta: mapCta(item?.cta),
				image: mapImagePair(item?.image),
				isActive: item?.isActive === true,
			}))
			.filter((item) => item.title),
		showNumbering: bool(data.showNumbering, true),
		backgroundColor: colorSlug(data.backgroundColor),
		theme: oneOf(data.theme, ["dark", "light"], "light"),
		accentColor: colorSlug(data.accentColor),
		imagePosition: oneOf(data.imagePosition, ["left", "right"], "right"),
		layoutVariant: "list",
		spacing: mapSpacing(data.spacing),
	};
}

const HIGHLIGHT_ICONS = ["check", "lock", "shield", "users", "mail", "clock", "star"];

function mapSubscriptionForm(data) {
	const form = data.form && typeof data.form === "object" ? data.form : null;
	const background = asObject(data.background);
	return {
		heading: mapHeading(data.heading),
		description: text(data.description),
		// `null` while the CMS has no provider (phases I/II): the section then shows no form. Sending needs `endpoint` and `list`.
		form: form
			? {
					endpoint: text(form.endpoint) || null,
					list: text(form.list) || null,
					emailPlaceholder: text(form.emailPlaceholder),
					submitLabel: text(form.submitLabel),
					successMessage: text(form.successMessage),
					pendingMessage: text(form.pendingMessage),
				}
			: null,
		highlights: asArray(data.highlights)
			.map((item) => ({ icon: oneOf(item?.icon, HIGHLIGHT_ICONS, "check"), text: text(item?.text) }))
			.filter((item) => item.text)
			.slice(0, 4),
		theme: oneOf(data.theme, ["dark", "light"], "dark"),
		background: { color: colorSlug(background.color), image: mapImagePair(background.image) },
		buttonVariant: oneOf(data.buttonVariant, ["default", "primary", "secondary", "outline", "link"], "primary"),
		layoutVariant: "default",
		spacing: mapSpacing(data.spacing),
	};
}

const MAPPERS = {
	HeroCarousel: mapHeroCarousel,
	Marquee: mapMarquee,
	NewsCarousel: mapNewsCarousel,
	CategoriesBlock: mapCategoriesBlock,
	ItemCollection: mapItemCollection,
	SubscriptionForm: mapSubscriptionForm,
};

/**
 * @param {unknown} rawSections `page.sections`
 * @returns {Array<{ type: string, data: any }>} Types without a mapper keep their raw data (the registry skips them)
 */
export function mapSections(rawSections) {
	return asArray(rawSections).flatMap((section) => {
		const type = text(section?.type);
		const data = asObject(section?.data);
		if (!type || data.enabled === false) {
			return [];
		}
		const map = MAPPERS[type];
		return [{ type, data: map ? map(data) : data }];
	});
}
