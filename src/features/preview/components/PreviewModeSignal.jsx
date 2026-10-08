export default function PreviewModeSignal() {
	return (
		<div className="flex items-center gap-2">
			<span className="relative flex size-4">
				<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
				<span className="relative inline-flex size-4 rounded-full bg-red-500" />
			</span>
			<p className="text-xs font-medium">Draft Mode</p>
		</div>
	);
}
