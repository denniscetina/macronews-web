function TagembedSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-[75%]">
			{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
				<div
					key={item}
					className="border border-gray-200 rounded-xl p-5 space-y-4 animate-pulse bg-white"
				>
					<div className="h-4 w-4 bg-gray-300 rounded" />

					<div className="flex gap-1">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="h-4 w-4 bg-gray-300 rounded-sm" />
						))}
					</div>

					<div className="space-y-2">
						<div className="h-3 w-full bg-gray-200 rounded" />
						<div className="h-3 w-5/6 bg-gray-200 rounded" />
						<div className="h-3 w-4/6 bg-gray-200 rounded" />
					</div>

					<div className="flex items-center gap-3 pt-2">
						<div className="h-8 w-8 bg-gray-300 rounded-full" />
						<div className="h-3 w-24 bg-gray-300 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}

export default TagembedSkeleton;
