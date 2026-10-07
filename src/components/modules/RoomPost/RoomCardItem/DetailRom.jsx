import PropTypes from "prop-types";
import View360Icon from "@/components/icons/View360.jsx";

const DetailRom = (props) => {
	const { data } = props;

	return (
		<div className="w-full h-full flex flex-col justify-between items-start gap-[16px]">
			<div className="w-full flex flex-col sm:flex-row justify-between gap-[16px]">
				<div className="flex flex-col gap-4 xl:gap-6 w-full md:w-1/2">
					<h4 className="uppercase header-6 font-futura tracking-[2.4px] leading-[20px]">
						{data?.amenitiesSectionTitle || "Amenities"}
					</h4>
					<div className="h-full max-h-fit lg:max-h-[300px] overflow-y-auto pr-2">
						<ul className="list-none m-0 p-0 flex flex-col gap-1">
							{data?.amenities?.length > 0 ? (
								data.amenities.map((amenity, index) => (
									<li
										key={index}
										className="font-futura text-[16px] leading-[25.6px] line-clamp-1"
									>
										- {amenity?.label || amenity?.name}
									</li>
								))
							) :
								null
							}
						</ul>
					</div>
				</div>
				<div className="flex flex-col gap-4 xl:gap-6 w-full md:w-1/2 justify-start items-start md:items-end">
					<h4 className="uppercase header-6 font-futura tracking-[2.4px] leading-[20px] text-right">
						{data?.specificationsSectionTitle || "Room Details"}
					</h4>

					{Array.isArray(data?.specifications) && data.specifications.length > 0 ? (
						<ul className="list-none m-0 p-0 flex flex-col gap-2 w-full">
							{data.specifications.map((specification, index) => {
								const label = String(specification?.label ?? "").trim();
								const value = String(specification?.value ?? "").trim();
								const iconUrl = specification?.icon?.url;
								const iconAlt = specification?.icon?.alt || label || "Specification";

								return (
									<li
										key={index}
										className="w-full flex items-center gap-2 md:justify-end"
									>
										{iconUrl && (
											<img
												src={iconUrl}
												alt={iconAlt}
												className="w-4 h-4 object-contain"
												loading="lazy"
											/>
										)}
										<span className="font-futura text-[16px] leading-[25.6px]">
											{[label, value].filter(Boolean).join(" ")}
										</span>
									</li>
								);
							})}
						</ul>
					) : (
						null
					)}

					{data.link360 && (
						<div className="w-full flex justify-center md:justify-end">
							<a
								href={data.link360}
								target="_blank"
								rel="noopener noreferrer"
								className="bg-contain w-[90px] h-auto xl:ml-auto cursor-pointer"
							>
								<View360Icon size={90} />
							</a>
						</div>
					)}

					{data?.description && (
						<p
							title={data.description}
							className="lg:hidden font-futura text-[16px] leading-[25.6px] line-clamp-4 w-full h-[100px] md:max-w-1/2 xl:ml-auto"
						>
							{data?.description || "No description available"}
						</p>
					)}
				</div>
			</div>

			{data?.description && (
				<p
					title={data.description}
					className="hidden lg:block font-futura text-[16px] leading-[25.6px] line-clamp-2 w-full h-[100px]"
				>
					{data?.description || "No description available"}
				</p>
			)}
		</div>
	);
};

DetailRom.propTypes = {
	data: PropTypes.object,
};

export default DetailRom;
