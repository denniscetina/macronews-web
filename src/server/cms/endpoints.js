/**
 * Every CMS path in one place. Paths are relative to WEB_API_URL.
 * NOTE: the real contract is still to be confirmed against the CMS.
 */
export const endpoints = {
	site: () => "site",
	page: (slug) => `pages/${slug}`,
	post: (slug) => `posts/${slug}`,
};
