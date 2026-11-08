import Image from "next/image";

// Figma "Placeholder Ad", captured at ~2x from the design file (the file is view-only, so no export): public/ads.
const PLACEHOLDERS = {
	leaderboard: { src: "/ads/placeholder-728x90.png", width: 1142, height: 141, slot: [728, 90] },
	mobile: { src: "/ads/placeholder-320x100.png", width: 1129, height: 351, slot: [320, 100] },
	// Figma "Placeholder Ad" between blocks: a 1216x196 box that fits (contain) the same 320x100 art, centered.
	banner: { src: "/ads/placeholder-320x100.png", width: 1129, height: 351, slot: [1216, 196] },
};

// Sidebar ad boxes (Figma "Placeholder Ad" 244 wide: 300x250 and 300x600 at 0.81). The design file has no export of
// these two, so they are drawn here with the same dotted-box look instead of an image.
const BOXES = { rectangle: { slot: [300, 250] }, skyscraper: { slot: [300, 600] } };

/**
 * Ad space. PLACEHOLDER: there is no ad system yet, the CMS only says "show ads" (`showAds`) and the positions
 * are the frontend's. It shows the design's placeholder image at the IAB proportion (728x90 beside a section title,
 * 320x100 inside the list) so the layout does not shift when a real slot replaces it.
 * `rectangle` (300x250) and `skyscraper` (300x600) are the sidebar boxes, drawn in CSS.
 * @param {{ size: "leaderboard" | "mobile" | "banner" | "rectangle" | "skyscraper", label: string, fluid?: boolean, className?: string }} props `fluid` fills its column instead of stopping at the IAB width
 */
export default function AdSlot({ size, label, fluid = false, className = "" }) {
	if (BOXES[size]) {
		const [width, height] = BOXES[size].slot;
		return (
			<aside
				aria-label={label}
				style={{ aspectRatio: `${width} / ${height}`, maxWidth: width }}
				className={`flex w-full flex-col items-center justify-center gap-1 border border-[#d4d4d4] bg-[#f5f5f5] text-center font-display ${className}`}
			>
				<span className="text-lg/6 font-black uppercase tracking-[-0.5px] text-[#171717]">Espacio <span className="text-primary">publicitario</span></span>
				<span className="text-[10px]/4 text-[#737373]">{label}</span>
				<span className="mt-1 rounded-sm border border-[#d4d4d4] bg-[#e5e5e5] px-4 py-1 text-xs/4 font-medium text-[#525252]">{width} × {height}</span>
			</aside>
		);
	}
	const { src, width, height, slot } = PLACEHOLDERS[size];
	if (size === "banner") {
		return (
			<aside aria-label={label} style={{ maxWidth: slot[0] }} className={`flex h-[100px] w-full justify-center md:h-[196px] ${className}`}>
				<Image src={src} alt={label} width={width} height={height} sizes="(min-width: 768px) 630px, 320px" className="h-full w-auto object-contain" />
			</aside>
		);
	}
	return (
		<aside aria-label={label} style={{ maxWidth: fluid ? undefined : slot[0] }} className={`w-full ${className}`}>
			<Image src={src} alt={label} width={width} height={height} loading="eager" sizes={fluid ? "(min-width: 1024px) 500px, 100vw" : "728px"} className="h-auto w-full" />
		</aside>
	);
}
