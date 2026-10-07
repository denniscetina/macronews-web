import PropTypes from "prop-types";

ListToContactUs.propTypes = {
	data: PropTypes.object,
};
export default function ListToContactUs({ data }) {
	const { listToContactUs = [] } = data;

	return (
		<section data-component="ListToContactUs" className="relative section-overflow w-full p-8 px-6 lg:py-16">
			<div className="max-w-7xl mx-auto flex flex-col gap-6">
				{listToContactUs.map((item, index) => (
					<div
						key={index}
						className="group flex flex-col md:flex-row md:justify-between md:items-center self-stretch p-4 border-b-1 border-b-[#253746] hover:cursor-pointer transition-all duration-300 hover:border-b-primary hover:scale-[1.02]"
					>
						<h3 className="text-start md:text-left font-futura font-normal text-[16px] tracking-[2.4px] uppercase text-[#5C6974] leading-[100%] [leading-trim:both] [text-edge:cap] transition-colors duration-300 group-hover:text-primary group-hover:tracking-wider mb-2 md:mb-0">
							{item.location}
						</h3>
						<p className="text-start md:text-right text-[#5C6974] font-futura font-normal text-md leading-[160%] [leading-trim:both] [text-edge:cap] transition-colors duration-300 group-hover:text-primary group-hover:tracking-wider">
							{item.contactInfo}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
