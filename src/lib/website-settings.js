import "server-only";
import { cache } from "react";
import { getWebsiteSettings } from "@/lib/api";

const getMenu = (menus, lang, type) => {
	const menuSource = type ? menus?.[lang]?.[type] : menus;

	if (!Array.isArray(menuSource)) {
		return [];
	}

	return menuSource.map((item) => ({
		id: item?.id,
		label: item?.label,
		url: item?.url,
		children: getMenu(item?.children, lang),
	}));
};

const normalizeAsset = (asset) => {
	if (!asset || typeof asset !== "object") {
		return {
			title: "",
			url: "",
			alt: "",
			description: "",
			caption: "",
		};
	}

	return {
		title: asset?.title ?? "",
		url: asset?.url ?? "",
		alt: asset?.alt ?? "",
		description: asset?.description ?? "",
		caption: asset?.caption ?? "",
	};
};

const getBrandAssets = (brand = {}) => {
	const normalizedOtherAssets = (brand?.otherAssets || []).reduce((acc, item) => {
		const key = item?.key;

		if (!key) {
			return acc;
		}

		acc[key] = normalizeAsset(item?.asset);
		return acc;
	}, {});

	return {
		logoLight: normalizeAsset(brand?.logoLight),
		logoDark: normalizeAsset(brand?.logoDark),
		favicon: normalizeAsset(brand?.favicon),
		...normalizedOtherAssets,
	};
};

export const getWebsiteSettingsData = cache(async (lang = "en") => {
	const data = await getWebsiteSettings();
	const { site, languages, menus, routes } = data ?? {};
	const assets = getBrandAssets(site?.settings?.brand);
	  return {
		  site: {
			  name: site?.name,
			  description: site?.description,
			  url: site?.url,
			  frontPages: site?.frontPages,
			  assets,
			  analytics: site?.settings?.analytics,
			  scripts: site?.scripts ?? {},
		  },
		  routes: routes ?? {},
		  frontPages: site?.frontPages ?? {},
		  menu: getMenu(menus, lang, "main_menu"),
		  secondaryMenu: getMenu(menus, lang, "secondary_menu"),
		  footerMenu: {
			  footerMenu : getMenu(menus, lang, "footer_menu"),
			  footerSecondaryMenu: getMenu(menus, lang, "footer_secondary_menu"),
			  settings: { brand: site.settings.brand, contacts: site.settings.contacts, socialApps: site.settings.socialApps, marketing: site.settings.marketing}
		  },
		  languages: languages
	  };
});
