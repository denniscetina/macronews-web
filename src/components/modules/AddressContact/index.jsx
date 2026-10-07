import PropTypes from "prop-types";
//icons
import shapeOrange from "@/assets/img/shape-orange.svg";

AddressContact.propTypes = {
	data: PropTypes.object,
};
export default function AddressContact({ data }) {
	const { iconAddressCard, titleAddressCard, addressCardContent } = data;

	return (
		<section data-component="AddressContact" className="relative bg-alt flex justify-center items-center py-8 lg:py-16">
			<div className="flex flex-col lg:flex-row justify-center items-start lg:items-center gap-8 lg:gap-16">
				<div className="flex items-center gap-4">
					<img
						src={iconAddressCard.url || shapeOrange}
						alt={iconAddressCard.filename || "icon address card"}
						className="w-[34px] h-[32px]"
					/>
					<h4 className="font-futura text-secondary font-medium leading-[32px] text-[20px] uppercase">
						{titleAddressCard}
					</h4>
				</div>
				<div className="text-secondary font-futura font-normal text-[20px] leading-[26px] w-[300px]">
					{addressCardContent}
				</div>
			</div>
		</section>
	);
}
