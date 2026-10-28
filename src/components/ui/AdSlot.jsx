/**
 * Ad space. PLACEHOLDER: there is no ad system yet, the CMS only says "show ads" (`showAds`) and the positions
 * are the frontend's. It reserves the IAB size so the layout does not shift when a real slot replaces it.
 * Figma "Placeholder Ad": 728x90 beside a section title, 320x100 inside the list.
 * @param {{ size: "leaderboard" | "mobile", label: string, fluid?: boolean, className?: string }} props `fluid` fills its column instead of stopping at the IAB width
 */
export default function AdSlot({ size, label, fluid = false, className = "" }) {
	const [width, height] = size === "leaderboard" ? [728, 90] : [320, 100];
	return (
		<aside
			aria-label={label}
			style={{ aspectRatio: `${width} / ${height}`, maxWidth: fluid ? undefined : width }}
			className={`flex w-full flex-col items-center justify-center gap-1 border border-neutral-300 bg-neutral-100 text-center ${className}`}
		>
			<p className="font-display text-lg/5 font-black uppercase tracking-tight text-ink sm:text-2xl/6">
				Espacio <span className="text-primary">publicitario</span>
			</p>
			<p className="text-[10px]/3 uppercase tracking-[0.15em] text-muted">
				{label} · {width} × {height}
			</p>
		</aside>
	);
}
