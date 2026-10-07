export const BOOKING_WIDGET_RENDER_MODE = {
	SURFACE: "surface",
	INVERSE: "inverse",
};

const CANONICAL_RENDER_MODES = new Set([
	BOOKING_WIDGET_RENDER_MODE.SURFACE,
	BOOKING_WIDGET_RENDER_MODE.INVERSE,
]);

const DEFAULT_RENDER_MODE = BOOKING_WIDGET_RENDER_MODE.SURFACE;

export function normalizeRenderMode(renderMode) {
	if (typeof renderMode !== "string") {
		return DEFAULT_RENDER_MODE;
	}

	if (CANONICAL_RENDER_MODES.has(renderMode)) {
		return renderMode;
	}

	return DEFAULT_RENDER_MODE;
}
