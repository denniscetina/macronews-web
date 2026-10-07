import PropTypes from "prop-types";

MapSection.propTypes = {
	data: PropTypes.object,
};

export default function MapSection({ data }) {
	const { logo, title, description, mapUrl } = data;

	return (
		<section data-component="MapSection" className="relative section-overflow w-full px-6 md:py-16 py-8 flex flex-col items-center bg-[#EDE6DE] gap-8">
			<div className="flex flex-col items-center gap-8 px-0 md:py-8 py-0 w-full max-w-[1190px]">
				<div className="flex flex-col items-center text-center px-8">
					<img
						src={logo.url}
						alt={logo.alt || "logo"}
						className="relative lg:w-10 lg:h-10 w-8 h-8 mb-2"
					/>
					<h4 className="font-normal text-3xl md:text-3xl lg:text-3xl text-secondary uppercase font-futura [leading-trim:both] leading-[100%] tracking-[2.4px] [text-edge:cap]">
						{title}
					</h4>
				</div>
				<div className="text-center text-[16px] font-futura font-normal  text-[#253746] leading-[160%] [leading-trim:both] [text-edge:cap]">
					{description}
				</div>
				<iframe
					style={{
						aspectRatio: "16/9",
					}}
					title="map"
					src={mapUrl}
					className="w-full h-auto mx-auto"
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
				></iframe>
			</div>
		</section>
	);
}
