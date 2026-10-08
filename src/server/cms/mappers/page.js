/** @param {any} raw */
export function mapPage(raw) {
	const page = raw?.page;
	if (!page) {
		return null;
	}
	return {
		title: page?.title ?? "",
		seo: page?.seo ?? {},
		modules: Array.isArray(page?.modules) ? page.modules : [],
		scripts: page?.scripts ?? {},
	};
}
