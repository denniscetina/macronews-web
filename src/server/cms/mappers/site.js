/**
 * Maps the CMS `site` payload to the model the frontend uses.
 * Components never read the raw CMS shape: if the CMS changes, only mappers change.
 * Empty placeholders the CMS sends (blank contacts, blank color rows...) are dropped here.
 */
import { isProduction } from "@/config/env";
import { tokenSlug } from "@/lib/design-tokens";
import { MEGA_MENU_MOCK } from "../mocks/mega-menu";
import { mapImage } from "./media";
import { originOf, resolveHref } from "./links";

const text = (value) => (typeof value === "string" ? value.trim() : "");
const asObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const asArray = (value) => (Array.isArray(value) ? value : []);

const MENU_KEYS = { main: "main_menu", secondary: "secondary_menu", footer: "footer_menu", footerSecondary: "footer_secondary_menu" };

function mapMenu(items, origins) {
	return asArray(items).map((item) => ({
		id: item?.id,
		label: text(item?.label),
		...resolveHref(item?.url, origins),
		target: item?.target ?? null,
		// WordPress "Description" of the menu item (the CMS may send it), shown as the card text of the mega menu.
		description: text(item?.description),
		children: mapMenu(item?.children, origins),
	}));
}

/** `mega` of a menu item (title, "view all" link, section cards, featured news); null when the item has none. */
function mapMega(raw, origins) {
	const mega = asObject(raw);
	const sections = asArray(mega.sections)
		.map((section) => ({
			title: text(section?.title),
			description: text(section?.description),
			...resolveHref(section?.url, origins),
			highlighted: section?.highlighted === true,
			badge: text(section?.badge),
		}))
		.filter((section) => section.title);
	if (sections.length === 0) {
		return null;
	}
	const featured = asObject(mega.featured);
	return {
		simulated: mega.simulated === true,
		title: text(mega.title),
		viewAll: mega.viewAll?.label ? { label: text(mega.viewAll.label), ...resolveHref(mega.viewAll.url, origins) } : null,
		sections,
		featured: text(featured.title)
			? {
					kicker: text(featured.kicker),
					title: text(featured.title),
					excerpt: text(featured.excerpt),
					image: mapImage(featured.image),
					...resolveHref(featured.url, origins),
					publishedAt: text(featured.publishedAt) || null,
					ctaLabel: text(featured.ctaLabel),
				}
			: null,
	};
}

/** Slug of a menu label: "Política" -> "politica". */
const labelKey = (label) => label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/**
 * Mega menu of a section built from its plain WordPress submenu (no extra CMS fields needed): each child is a card
 * (title, and its description when the menu item has one) and the parent, when it has a real link, is the "view all".
 * The title, the "view all" text and the featured news are not in a plain submenu: the front fills the texts in and
 * the featured news needs the `mega` field (see `mocks/mega-menu.js`).
 */
function megaFromChildren(item) {
	return {
		simulated: false,
		title: "",
		viewAll: item.href ? { label: "", href: item.href, external: item.external } : null,
		sections: item.children.map((child) => ({ title: child.label, description: child.description, href: child.href, external: child.external, highlighted: false, badge: "" })).filter((section) => section.title),
		featured: null,
	};
}

/**
 * Main menu with its mega menus. Where each one comes from, in order:
 * 1. `mega` sent by the CMS on the item (cards, "view all" and featured news, see the proposed contract in `mocks/mega-menu.js`);
 * 2. the item's real submenu (children): one card per child, no featured news;
 * 3. outside production only, the Figma example simulated for "Política" so the design can be seen before the CMS has it.
 * The sections also become `children` so the mobile menu lists them.
 */
function mapMainMenu(items, origins) {
	const simulate = !isProduction();
	return asArray(items).map((item) => {
		const base = { ...mapMenu([item], origins)[0] };
		const fromCms = mapMega(item?.mega, origins);
		const fromChildren = !fromCms && base.children.length > 0 ? megaFromChildren(base) : null;
		const mock = !fromCms && !fromChildren && simulate ? mapMega(MEGA_MENU_MOCK[labelKey(base.label)], origins) : null;
		const mega = fromCms ?? (fromChildren?.sections.length ? fromChildren : null) ?? mock;
		if (!mega) {
			return { ...base, mega: null };
		}
		const children = base.children.length > 0 ? base.children : mega.sections.map((section) => ({ id: undefined, label: section.title, href: section.href, external: section.external, target: null, description: "", children: [] }));
		return { ...base, mega, children };
	});
}

function mapContact(item) {
	const value = text(item?.contactValue);
	const type = text(item?.type) || "phone";
	const digits = value.replace(/[^\d+]/g, "");
	const href =
		type === "email" ? `mailto:${value}` : type === "whatsapp" ? `https://wa.me/${digits.replace(/^\+/, "")}` : type === "phone" ? `tel:${digits}` : null;
	return { name: text(item?.displayName), value, type, href };
}

/** Per-language route table: `{ [lang]: { pages, posts, categories } }`. */
const mapRoute = (route) => ({
	id: route?.id,
	slug: route?.slug ?? "",
	title: route?.title ?? route?.name ?? "",
	uri: route?.uri ?? "",
	updatedAt: route?.updatedAt ?? "",
});

function mapRoutes(raw) {
	return Object.fromEntries(
		Object.entries(asObject(raw)).map(([lang, entry]) => [
			lang,
			{
				pages: asArray(entry?.posts?.pages).map(mapRoute),
				posts: asArray(entry?.posts?.blog).map(mapRoute),
				categories: asArray(entry?.taxonomies?.["blog-categories"]).map(mapRoute),
			},
		]),
	);
}

/** Design tokens set in CMS > Site Settings > Advanced > Design Tokens (rows left blank are ignored). */
function mapDesign(advanced) {
	return {
		colors: asArray(advanced?.colorSystem)
			.map((row) => ({ name: text(row?.colorName), slug: tokenSlug(row?.colorSlug), value: text(row?.colorValue) }))
			.filter((row) => row.slug && row.value),
		fonts: asArray(advanced?.fontSystem)
			.map((row) => ({
				name: text(row?.fontName),
				slug: tokenSlug(row?.fontSlug),
				family: text(row?.fontFamily),
				fallback: text(row?.fontFallback) || "sans-serif",
			}))
			.filter((row) => row.slug && row.family),
		// Values are in rem (the CMS keeps them as numbers).
		spacing: asArray(advanced?.spacingSystem)
			.map((row) => ({ name: text(row?.spacingName), slug: tokenSlug(row?.spacingSlug), value: Number(row?.spacingValue) }))
			.filter((row) => row.slug && Number.isFinite(row.value)),
	};
}

/** @param {any} raw */
export function mapSite(raw) {
	const site = asObject(raw?.site);
	const settings = asObject(site.settings);
	const brand = asObject(settings.brand);
	const origins = [originOf(site.url), originOf(site.url_wp)].filter(Boolean);

	const menus = Object.fromEntries(
		Object.entries(asObject(raw?.menus)).map(([lang, byType]) => [
			lang,
			Object.fromEntries(Object.entries(MENU_KEYS).map(([key, type]) => [key, key === "main" ? mapMainMenu(byType?.[type], origins) : mapMenu(byType?.[type], origins)])),
		]),
	);

	return {
		name: text(brand.brandName) || text(site.name),
		description: text(site.description),
		url: text(site.url),
		cmsUrl: text(site.url_wp),
		locale: text(site.locale),
		frontPages: asObject(site.frontPages),
		brand: {
			tagline: text(brand.tagline),
			logoLight: mapImage(brand.logoLight),
			logoDark: mapImage(brand.logoDark),
			favicon: mapImage(brand.favicon || site.favicon),
			legalName: text(brand.legalName),
			address: text(brand.address),
			businessHours: text(brand.businessHours),
			otherAssets: asArray(brand.otherAssets)
				.map((row) => ({ key: text(row?.key), image: mapImage(row?.asset) }))
				.filter((row) => row.key && row.image),
		},
		contacts: asArray(settings.contacts).map(mapContact).filter((contact) => contact.value),
		social: asArray(settings.socialApps?.platforms?.items)
			.map((item) => ({ key: text(item?.key), label: text(item?.label), url: text(item?.url) }))
			.filter((item) => item.url),
		apps: { appStore: text(settings.socialApps?.appStoreUrl), googlePlay: text(settings.socialApps?.googlePlayUrl) },
		design: mapDesign(settings.advanced),
		analytics: asObject(settings.analytics),
		marketing: asObject(settings.marketing),
		security: asObject(settings.security),
		languages: {
			default: text(raw?.languages?.default),
			available: asArray(raw?.languages?.available).map((lang) => ({ slug: text(lang?.slug), locale: text(lang?.locale) })),
		},
		menus,
		routes: mapRoutes(raw?.routes),
	};
}

/**
 * @param {ReturnType<typeof mapSite> | null} site
 * @param {string} lang
 * @param {"main" | "secondary" | "footer" | "footerSecondary"} type
 */
export const getMenu = (site, lang, type) => site?.menus?.[lang]?.[type] ?? [];
