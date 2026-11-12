/**
 * Every CMS path in one place. Paths are relative to the API root (`/wp-json/api/v1`),
 * see `apiRoot` in `client.js`. Content endpoints only support `lang`. The CMS has no
 * list of posts (`GET /blog` was removed in core 0.14.0): a post is read by its slug, and lists come from the page sections.
 */
const withLang = (path, lang) => (lang ? `${path}?lang=${encodeURIComponent(lang)}` : path);

export const endpoints = {
	site: () => "site",
	page: (slug, lang, { draft = false } = {}) => withLang(`${draft ? "preview/" : ""}pages/${slug}`, lang),
	post: (slug, lang, { draft = false } = {}) => withLang(`${draft ? "preview/" : ""}blog/${slug}`, lang),
	/** @param {URLSearchParams} query */
	newsNearby: (query) => `news/nearby?${query.toString()}`,
	ads: (lang) => withLang("ads", lang),
	/** @param {URLSearchParams} query */
	reels: (query) => `reels?${query.toString()}`,
};
