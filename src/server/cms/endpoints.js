/**
 * Every CMS path in one place. Paths are relative to the API root (`/wp-json/api/v1`),
 * see `apiRoot` in `client.js`. Content endpoints only support `lang`: the CMS ignores
 * category/search/pagination params on `/blog`, so those are resolved in `services/posts.js`.
 */
const withLang = (path, lang) => (lang ? `${path}?lang=${encodeURIComponent(lang)}` : path);

export const endpoints = {
	site: () => "site",
	page: (slug, lang, { draft = false } = {}) => withLang(`${draft ? "preview/" : ""}pages/${slug}`, lang),
	post: (slug, lang, { draft = false } = {}) => withLang(`${draft ? "preview/" : ""}blog/${slug}`, lang),
	posts: (lang) => withLang("blog", lang),
	/** @param {URLSearchParams} query */
	newsNearby: (query) => `news/nearby?${query.toString()}`,
};
