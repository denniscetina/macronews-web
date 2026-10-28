import Image from "next/image";

// Figma "Placeholder Ad", captured at ~2x from the design file (the file is view-only, so no export): public/ads.
const PLACEHOLDERS = {
	leaderboard: { src: "/ads/placeholder-728x90.png", width: 1142, height: 141, slot: [728, 90] },
	mobile: { src: "/ads/placeholder-320x100.png", width: 1129, height: 351, slot: [320, 100] },
};

/**
 * Ad space. PLACEHOLDER: there is no ad system yet, the CMS only says "show ads" (`showAds`) and the positions
 * are the frontend's. It shows the design's placeholder image at the IAB proportion (728x90 beside a section title,
 * 320x100 inside the list) so the layout does not shift when a real slot replaces it.
 * @param {{ size: "leaderboard" | "mobile", label: string, fluid?: boolean, className?: string }} props `fluid` fills its column instead of stopping at the IAB width
 */
export default function AdSlot({ size, label, fluid = false, className = "" }) {
	const { src, width, height, slot } = PLACEHOLDERS[size];
	return (
		<aside aria-label={label} style={{ maxWidth: fluid ? undefined : slot[0] }} className={`w-full ${className}`}>
			<Image src={src} alt={label} width={width} height={height} loading="eager" sizes={fluid ? "(min-width: 1024px) 500px, 100vw" : "728px"} className="h-auto w-full" />
		</aside>
	);
}
