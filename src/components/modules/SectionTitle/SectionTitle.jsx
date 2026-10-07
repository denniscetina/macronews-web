export default function SectionTitle({ data }) {
	const background =
		data.backgroundColor === "bg-primary"
			? "#F7F4F0"
			: data.backgroundColor === "bg-secondary"
				? "#EDE6DE"
				: data.backgroundColor === "bg-white"
					? "#FFFFFF"
					: "#F7F4F0";

	return (
		<section
            data-component="SectionTitle"
			className="relative w-full overflow-y-hidden flex flex-col gap-16 pb-8 justify-center items-center self-stretch"
			style={{ background }}
		>
			<div className="flex flex-col justify-center items-center gap-20 self-stretch mt-16 px-6">
				{data.showDividingLine && (
					<div className="border border-[#929BA2] w-full lg:max-w-[1485px]" />
				)}

				<div className="flex flex-col justify-center items-center gap-4 self-stretch">
					{data.logo && (
						<img
							src={data.logo.url}
							alt={data.logo.alt || "Section Logo"}
							className="max-w-8.5 max-h-8"
						/>
					)}
					{data.title && (
						<h2 className="text-secondary text-center font-futura text-[20px] font-normal leading-5 tracking-[2.4px] uppercase">
							{data.title}
						</h2>
					)}
				</div>
			</div>
		</section>
	);
}
