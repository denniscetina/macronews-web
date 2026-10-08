import clsx from "clsx";
import DisablePreviewModeAction from "./DisablePreviewModeAction";
import PreviewModeSignal from "./PreviewModeSignal";

export default function Controls({ activeViewport, getViewportHref, targetPath, viewports }) {
	return (
		<header className="grid grid-cols-1 items-center gap-4 rounded-xl border border-zinc-300 bg-white px-4 py-3 shadow-sm md:grid-cols-3">
			<div className="flex justify-center md:justify-start">
				<PreviewModeSignal />
			</div>
			<nav className="flex items-center justify-center gap-4" aria-label="Viewport">
				{Object.entries(viewports).map(([viewport, config]) => (
					<a
						key={viewport}
						href={getViewportHref(viewport)}
						aria-current={viewport === activeViewport ? "page" : undefined}
						className={clsx("text-xs", viewport === activeViewport ? "font-medium text-black" : "text-zinc-400")}
					>
						{config.label}
					</a>
				))}
			</nav>
			<div className="flex items-center justify-center gap-4 md:justify-end">
				<a href={targetPath} target="_blank" rel="noreferrer" className="text-xs underline">
					Open page
				</a>
				<DisablePreviewModeAction />
			</div>
		</header>
	);
}
