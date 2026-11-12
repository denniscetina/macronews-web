"use client";

import { useEffect, useId, useSyncExternalStore } from "react";
import { getView, mountSlot, subscribe } from "./ad-store";

/** The only breakpoint between the desktop and mobile formats of a space (the design's, `md`). */
const MOBILE_QUERY = "(max-width: 767px)";

const subscribeScreen = (onChange) => {
	const query = window.matchMedia(MOBILE_QUERY);
	query.addEventListener("change", onChange);
	return () => query.removeEventListener("change", onChange);
};
const getScreen = () => (window.matchMedia(MOBILE_QUERY).matches ? "mobile" : "desktop");

/**
 * The piece an ad space shows, chosen in the browser (null on the server, while the inventory loads and when nothing fits:
 * the space collapses). The space is re-chosen when the screen crosses the breakpoint.
 * @param {import("@/lib/ads/select").AdSpace | null} space CMS `ads` of the component
 * @param {{ lang: string, only?: "desktop" | "mobile" }} options `only`: the space exists on one screen only
 */
export function useAd(space, { lang, only } = {}) {
	const id = useId();
	const screen = useSyncExternalStore(subscribeScreen, getScreen, () => null);
	const active = Boolean(space) && screen !== null && (!only || only === screen);
	useEffect(() => (active ? mountSlot(id, space, screen, lang) : undefined), [active, id, space, screen, lang]);
	return useSyncExternalStore(subscribe, () => (active ? getView(id) : null), () => null);
}
