/**
 * Maps the page `sections` of the CMS (`{ type, data }`, contracts in macropress-core `.docs/Components`)
 * to the models of the section components. Components never read the raw payload.
 * Sections the editor switched off (`{ enabled: false }`) are dropped here.
 */
import { tokenSlug } from "@/lib/design-tokens";
import { mapImage } from "./media";
import { resolveHref } from "./links";

const text = (value) => (typeof value === "string" ? value.trim() : "");
const asObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const asArray = (value) => (Array.isArray(value) ? value : []);
const bool = (value, fallback) => (typeof value === "boolean" ? value : fallback);
const number = (value, fallback) => (Number.isFinite(Number(value)) && value !== null && value !== "" ? Number(value) : fallback);
const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);

const SIDES = ["top", "right", "bottom", "left"];

/** Color slugs reach the components already normalized ("--macro-red" -> "macro-red"), "" when empty. */
const colorSlug = (value) => tokenSlug(value);

/** `{ url, title, target }` of an ACF link -> `{ href, external, label, target }`, null without a URL. */
function mapCta(raw) {
	const cta = asObject(raw);
	const { href, external } = resolveHref(cta.url);
	return href ? { href, external, label: text(cta.title), target: text(cta.target) || null } : null;
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

const MAPPERS = {
	HeroCarousel: mapHeroCarousel,
	Marquee: mapMarquee,
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
