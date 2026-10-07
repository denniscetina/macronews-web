export const PREVIEW_VIEWPORTS = {

	desktop: {
		label: "Desktop",
		width: null,
	},
	tablet: {
		label: "Tablet",
		width: 768,
	},
	mobile: {
		label: "Mobile",
		width: 390,
	}
};

export function getPreviewSlugSegments(slug) {
	if (!Array.isArray(slug)) {
		return [];
	}

	return slug.filter(Boolean);
}

export function buildPreviewViewportHref({ slugPath, viewport }) {
	const basePath = slugPath ? `/preview/${slugPath}` : "/preview";
	const query = new URLSearchParams();

	if (viewport !== "desktop") {
		query.set("vp", viewport);
	}

	const queryString = query.toString();
	return queryString ? `${basePath}?${queryString}` : basePath;
}

export function resolvePreviewTargetPath(slugPath) {
	if (!slugPath) {
		return "/";
	}

	const segments = slugPath.split("/").filter(Boolean);

	if (segments[0] === "preview") {
		segments.shift();
	}

	if (segments[1] === "preview") {
		segments.splice(1, 1);
	}

	const cleanSlugPath = segments.join("/");

	return cleanSlugPath ? `/${cleanSlugPath}` : "/";
}

export function resolvePreviewViewport(viewport, viewports = PREVIEW_VIEWPORTS) {
	return Object.prototype.hasOwnProperty.call(viewports, viewport)
		? viewport
		: "desktop";
}

export function buildPreviewIframeSrc(targetPath) {
	const iframeUrl = new URL(targetPath || "/", "http://preview.local");
	iframeUrl.searchParams.set("previewFrame", "1");

	return `${iframeUrl.pathname}${iframeUrl.search}`;
}
