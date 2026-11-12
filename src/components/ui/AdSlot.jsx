"use client";

import AdPiece from "@/components/ads/AdPiece";
import { useAd } from "@/components/ads/useAd";

/**
 * Ad space of a component. It paints the piece the browser chooses for the CMS `ads` of the component (core ad manager) and
 * nothing when there is none: the space collapses, there is no placeholder.
 * @param {{ ads: import("@/lib/ads/select").AdSpace | null, lang: string, label: string, only?: "desktop" | "mobile", className?: string }} props
 *   `label`: fallback of the "Publicidad" label (the inventory sends its own); `only`: the space exists on one screen only
 */
export default function AdSlot({ ads, lang, label, only, className = "" }) {
	const view = useAd(ads, { lang, only });
	return view ? <AdPiece piece={view.piece} label={view.label || label} className={className} /> : null;
}
