/**
 * Maps the CMS `site` payload to the model the frontend uses.
 * Components never read the raw CMS shape: if the CMS changes, only mappers change.
 */
const asset = (value) => ({
	url: value?.url ?? "",
	alt: value?.alt ?? "",
	title: value?.title ?? "",
});

const mapMenu = (items) =>
	Array.isArray(items)
		? items.map((item) => ({
				id: item?.id,
				label: item?.label ?? "",
				url: item?.url ?? "",
				children: mapMenu(item?.children),
			}))
		: [];

/** @param {any} raw */
export function mapSite(raw) {
	const site = raw?.site ?? {};
	const brand = site?.settings?.brand ?? {};
	return {
		name: site?.name ?? "",
		description: site?.description ?? "",
		url: site?.url ?? "",
		frontPages: site?.frontPages ?? {},
		brand: {
			logoLight: asset(brand?.logoLight),
			logoDark: asset(brand?.logoDark),
			favicon: asset(brand?.favicon),
		},
		analytics: site?.settings?.analytics ?? {},
		contacts: site?.settings?.contacts ?? {},
		socialApps: site?.settings?.socialApps ?? {},
		languages: raw?.languages ?? { available: [] },
		menus: raw?.menus ?? {},
		routes: raw?.routes ?? {},
	};
}

/**
 * @param {ReturnType<typeof mapSite>} site
 * @param {string} lang
 * @param {string} type e.g. "main_menu"
 */
export const getMenu = (site, lang, type) => mapMenu(site?.menus?.[lang]?.[type]);
