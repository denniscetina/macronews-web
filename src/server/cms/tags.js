/** Cache tags. Used by the CMS client (tagging) and by revalidation (invalidating). */
export const tags = {
	site: "site",
	page: (slug) => `page:${slug}`,
	post: (slug) => `post:${slug}`,
	type: (type) => `type:${type}`,
};
