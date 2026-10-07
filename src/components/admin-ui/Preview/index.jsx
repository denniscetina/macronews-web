import Controls from "./Controls";

export default function Preview({
	activeViewport,
	activeViewportWidth,
	controls,
	getViewportHref,
	iframeSrc,
	openPageLabel = "Open page",
	targetPath,
	viewports,
}) {
	return (
		<main className="flex min-h-screen flex-col gap-4 bg-[#f3f4f6] p-4 md:p-6">
			{controls || (
				<Controls
					activeViewport={activeViewport}
					getViewportHref={getViewportHref}
					openPageLabel={openPageLabel}
					targetPath={targetPath}
					viewports={viewports}
				/>
			)}

			<section className="flex-1 overflow-auto rounded-xl border border-zinc-300 bg-[#e5e7eb] p-4 shadow-inner md:p-6">
				<div
					className="mx-auto h-[calc(100vh-180px)] min-h-[560px] max-w-full overflow-hidden border border-zinc-300 bg-white shadow-xl transition-[width] duration-300"
					style={{ width: activeViewportWidth ? `${activeViewportWidth}px` : "100%" }}
				>
					<iframe
						title="Preview frame"
						src={iframeSrc}
						className="h-full w-full border-0 bg-white"
					/>
				</div>
			</section>
		</main>
	);
}
