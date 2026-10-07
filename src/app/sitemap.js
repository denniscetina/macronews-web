import { getWebsiteSettingsData } from "@/lib/website-settings";

const ROUTE_GROUP_KEYS = ["pages", "blog", "rooms", "offers"];

const removeTrailingSlash = (value = "") => {
	if (value.length > 1 && value.endsWith("/")) {
		return value.slice(0, -1);
	}

	return value;
};

const normalizeHostnameWithWww = (value = "") => {
	if (!value.trim()) {
		return value;
	}

	try {
		const parsedUrl = new URL(value);

		if (!parsedUrl.hostname.startsWith("www.")) {
			parsedUrl.hostname = `www.${parsedUrl.hostname}`;
		}

		return parsedUrl.toString();
	} catch {
		return value;
	}
};

const getFrontPageSlug = (frontPages = {}, lang = "") => {
	const rawSlug = frontPages?.[lang]?.slug;

	return typeof rawSlug === "string" ? rawSlug.trim().replace(/^\/+|\/+$/g, "") : "";
};

const normalizeFrontPagePath = (pathname = "/", { lang = "", frontPages = {}, defaultLanguage = "en" } = {}) => {
	const normalizedPath = removeTrailingSlash(pathname) || "/";
	const frontPageSlug = getFrontPageSlug(frontPages, lang);

	if (!frontPageSlug) {
		return normalizedPath;
	}

	const prefixedFrontPagePath = removeTrailingSlash(`/${lang}/${frontPageSlug}`) || "/";
	const unprefixedFrontPagePath = removeTrailingSlash(`/${frontPageSlug}`) || "/";

	if (normalizedPath === prefixedFrontPagePath) {
		return lang === defaultLanguage ? "/" : `/${lang}`;
	}

	if (lang === defaultLanguage && normalizedPath === unprefixedFrontPagePath) {
		return "/";
	}

	return normalizedPath;
};

const normalizePathFromRoute = (route = {}, options = {}) => {
	const rawUri = typeof route?.uri === "string" ? route.uri : "";

	if (rawUri.trim()) {
		const normalizedUri = removeTrailingSlash(rawUri.trim());
		const prefixedPath = normalizedUri.startsWith("/") ? normalizedUri : `/${normalizedUri}`;
		return normalizeFrontPagePath(prefixedPath, options);
	}

	const rawUrl = typeof route?.url === "string" ? route.url : "";
	if (!rawUrl.trim()) {
		return "";
	}

	try {
		const parsedUrl = new URL(rawUrl);
		const normalizedPath = removeTrailingSlash(parsedUrl.pathname || "/");
		return normalizeFrontPagePath(normalizedPath || "/", options);
	} catch {
		return "";
	}
};

const getLanguageSlugs = (languages = {}) => {
	const available = Array.isArray(languages?.available) ? languages.available : [];
	const defaultLanguage =
		typeof languages?.default === "string" && languages.default.trim()
			? languages.default.trim()
			: "en";

	const slugs = available
		.map((item) => (typeof item === "string" ? item : item?.slug))
		.filter((slug) => typeof slug === "string" && slug.trim())
		.map((slug) => slug.trim());

	if (slugs.length === 0) {
		return [defaultLanguage];
	}

	if (!slugs.includes(defaultLanguage)) {
		slugs.unshift(defaultLanguage);
	}

	return Array.from(new Set(slugs));
};

const getDefaultLanguageSlug = (languages = {}) => {
	if (typeof languages?.default === "string" && languages.default.trim()) {
		return languages.default.trim();
	}

	return "en";
};

const getRouteItemsByLanguage = (routesByLanguage = {}) => {
	const routeGroups = [
		routesByLanguage?.posts,
		routesByLanguage?.postTypes,
		routesByLanguage?.posttypes,
	].filter(Boolean);

	return routeGroups.flatMap((group) =>
		ROUTE_GROUP_KEYS.flatMap((key) => (Array.isArray(group?.[key]) ? group[key] : [])),
	);
};

const getPathnameFromUrl = (value = "", baseUrl = "") => {
	try {
		return new URL(value).pathname || "/";
	} catch {
		try {
			return new URL(value, baseUrl).pathname || "/";
		} catch {
			return "/";
		}
	}
};

const getSortMeta = (url, baseUrl, languageOrderMap, defaultLanguage) => {
	const rawPathname = getPathnameFromUrl(url, baseUrl);
	const normalizedPathname = removeTrailingSlash(rawPathname) || "/";
	const segments = normalizedPathname.split("/").filter(Boolean);
	const firstSegment = segments[0] ?? "";
	const hasLanguagePrefix = Object.prototype.hasOwnProperty.call(languageOrderMap, firstSegment);
	const languageSlug = hasLanguagePrefix ? firstSegment : defaultLanguage;
	const localSegments = hasLanguagePrefix ? segments.slice(1) : segments;
	const localPath = removeTrailingSlash(`/${localSegments.join("/")}`) || "/";

	return {
		languageIndex: languageOrderMap[languageSlug] ?? Number.MAX_SAFE_INTEGER,
		localPath,
		normalizedPathname,
	};
};

export default async function sitemap() {
	const { routes = {}, frontPages = {}, languages = {}, site = {}} = await getWebsiteSettingsData();
	const baseUrlSource =
		process.env.NEXT_PUBLIC_SITE_URL || site?.url || "https://www.unicohotelrivieramaya.com";
	const baseUrl = removeTrailingSlash(normalizeHostnameWithWww(baseUrlSource));
	const defaultLanguage = getDefaultLanguageSlug(languages);
	const languageSlugs = getLanguageSlugs(languages);
	const orderedLanguageSlugs = Array.from(new Set([defaultLanguage, ...languageSlugs]));
	const languageOrderMap = orderedLanguageSlugs.reduce((accumulator, slug, index) => {
		accumulator[slug] = index;
		return accumulator;
	}, {});
	const visited = new Set();
	const now = new Date();

	const entries = languageSlugs.flatMap((lang) => {
		const routesByLanguage = routes?.[lang] ?? {};
		const routeItems = getRouteItemsByLanguage(routesByLanguage);

		return routeItems.reduce((accumulator, route) => {
			const normalizedPath = normalizePathFromRoute(route, {
				lang,
				frontPages,
				defaultLanguage,
			});

			if (!normalizedPath) {
				return accumulator;
			}

			const normalizedUrl =
				normalizedPath === "/" ? baseUrl : `${baseUrl}${normalizedPath}`;

			if (visited.has(normalizedUrl)) {
				return accumulator;
			}

			visited.add(normalizedUrl);

			const updatedAt = new Date(route?.updatedAt ?? now);
			const lastModified = Number.isNaN(updatedAt.getTime()) ? now : updatedAt;

			accumulator.push({
				url: normalizedUrl,
				lastModified,
			});
			return accumulator;
		}, []);
	});

	return entries.sort((a, b) => {
		const sortA = getSortMeta(a.url, baseUrl, languageOrderMap, defaultLanguage);
		const sortB = getSortMeta(b.url, baseUrl, languageOrderMap, defaultLanguage);

		if (sortA.languageIndex !== sortB.languageIndex) {
			return sortA.languageIndex - sortB.languageIndex;
		}

		const localPathCompare = sortA.localPath.localeCompare(sortB.localPath);
		if (localPathCompare !== 0) {
			return localPathCompare;
		}

		return sortA.normalizedPathname.localeCompare(sortB.normalizedPathname);
	});
}
