/**
 * Maps the CMS `site` payload to the model the frontend uses.
 * Components never read the raw CMS shape: if the CMS changes, only mappers change.
 * Empty placeholders the CMS sends (blank contacts, blank color rows...) are dropped here.
 */
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
		children: mapMenu(item?.children, origins),
	}));
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

/** Design tokens set in CMS > Site Settings > Advanced (rows left blank are ignored). */
function mapDesign(advanced) {
	return {
		colors: asArray(advanced?.colorSystem)
			.map((row) => ({ name: text(row?.colorName), slug: text(row?.colorSlug), value: text(row?.colorValue) }))
			.filter((row) => row.slug && row.value),
		fonts: asArray(advanced?.fontSystem)
			.map((row) => ({
				name: text(row?.fontName),
				slug: text(row?.fontSlug),
				family: text(row?.fontFamily),
				fallback: text(row?.fontFallback) || "sans-serif",
			}))
			.filter((row) => row.slug && row.family),
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
			Object.fromEntries(Object.entries(MENU_KEYS).map(([key, type]) => [key, mapMenu(byType?.[type], origins)])),
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
