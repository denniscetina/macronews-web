import Controls from "./Controls";

/** Preview shell: toolbar + the real page inside an iframe sized to the chosen viewport. */
export default function Preview({ activeViewport, activeViewportWidth, getViewportHref, iframeSrc, targetPath, viewports }) {
	return (
		<main className="flex min-h-screen flex-col gap-4 bg-zinc-100 p-4 md:p-6">
			<Controls
				activeViewport={activeViewport}
				getViewportHref={getViewportHref}
				targetPath={targetPath}
				viewports={viewports}
			/>
			<section className="flex-1 overflow-auto rounded-xl border border-zinc-300 bg-zinc-200 p-4 shadow-inner md:p-6">
				<div
					className="mx-auto h-[calc(100vh-180px)] min-h-[560px] max-w-full overflow-hidden border border-zinc-300 bg-white shadow-xl transition-[width] duration-300"
					style={{ width: activeViewportWidth ? `${activeViewportWidth}px` : "100%" }}
				>
					<iframe title="Preview frame" src={iframeSrc} className="h-full w-full border-0 bg-white" />
				</div>
			</section>
		</main>
	);
}
