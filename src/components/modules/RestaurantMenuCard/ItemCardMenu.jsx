import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { Fragment, memo, useCallback, useMemo, useRef } from "react";
import FlipCard from "../../utils/FlipCard";
import View360Icon from "@/components/icons/View360.jsx";
import ChevronIcon from "./ChevronIcon";

const ItemCardMenu = memo(
	({
		data: {
			basic_info = {},
			card_flip_back = {},
			enable_card_flip = false,
		} = {},
		index,
		labels = {},
	}) => {
		const {
			viewDetails = "View Details",
			openDaily = "Open Daily:",
			dressCode = "Dress Code:",
		} = labels;
		const refFlipCard = useRef(null);

		const handleFlipCard = useCallback(() => {
			if (refFlipCard.current) {
				refFlipCard.current.handleFlip();
			}
		}, []);

		const frontContent = useMemo(
			() => (
				<div className="flex flex-col gap-[32px]">
					<div className="overflow-hidden w-full h-full">
						<motion.img
							transition={{ duration: 0.3 }}
							src={basic_info?.dish_image?.url}
							alt={basic_info?.dish_image?.alt || "Menu Item"}
							onClick={enable_card_flip ? handleFlipCard : undefined}
							className="w-full h-[300px] lg:h-[545px] object-cover"
							loading="lazy"
						/>
					</div>
					<div className="flex flex-col gap-[16px] w-full justify-content-start items-start mt-3 mx-3 mb-[24px]">
						<h4 className="font-glosa capitalize text-start text-[24px] font-[500] leading-[29px]">
							{basic_info?.dish_name}
						</h4>
						<div
							className="flex flex-row flex-wrap gap-[16px] justify-start items-center line-clamp-2"
							title={basic_info?.dish_categories
								?.map((category) => category.name)
								.join(", ")}
						>
							{basic_info?.dish_categories?.map((category, idx) => (
								<Fragment key={idx}>
									<span className="font-futura text-[16px] font-normal tracking-[2.4px] uppercase">
										{category.name}
									</span>
									{idx < basic_info.dish_categories.length - 1 && (
										<pre className="font-futura text-[16px] font-normal uppercase">
											|
										</pre>
									)}
								</Fragment>
							))}
						</div>
						{enable_card_flip && (
							<button
								className="flex justify-start items-center cursor-pointer gap-2 font-futura font-[700] text-[18px] leading-[23.4px] tracking-[0.3px] group"
								onClick={handleFlipCard}
								type="button"
							>
								<span className="leading-[16px] text-[18px] font-[400] tracking-[0.3px] group-hover:text-primary transition-colors duration-300">
									{viewDetails}
								</span>
								{ChevronIcon}
							</button>
						)}
					</div>
				</div>
			),
			[basic_info, enable_card_flip, handleFlipCard, viewDetails],
		);

		const backContent = useMemo(
			() => (
				<div className="flex flex-col justify-between gap-[32px] h-full w-full">
					<div className="flex flex-col gap-7 min-h-[70%]">
						<img
							src={card_flip_back?.restaurant_logo?.url}
							alt={
								card_flip_back?.restaurant_logo?.alt ||
								`Restaurant Logo ${basic_info?.dish_name}`
							}
							style={{
								maxWidth:
									`${Number(card_flip_back.max_width_restaurant_logo)}px` ||
									"265px",
								maxHeight:
									`${Number(card_flip_back.max_height_restaurant_logo)}px` ||
									"60px",
							}}
							className="w-full h-full object-contain"
						/>
						<div className="w-full lg:w-[75%] h-[1px] border-b-[1px] border-b-menuBar " />
						<div className="flex flex-row flex-wrap gap-[16px] justify-start items-center">
							{basic_info?.dish_categories?.map((category, idx) => (
								<Fragment key={idx}>
									<span className="font-futura text-[16px] font-normal tracking-[2.4px] uppercase">
										{category.name}
									</span>
									{idx < basic_info.dish_categories.length - 1 && (
										<pre className="font-futura text-[16px] font-normal uppercase">
											|
										</pre>
									)}
								</Fragment>
							))}
						</div>
						<p className="font-futura text-[16px] font-normal leading-[25.6px] text-justify text-[#5C6974] lg:max-h-[280px] overflow-y-auto">
							{card_flip_back?.description || "No description available."}
						</p>
						<div className="flex flex-col justify-start items-start">
							<span className="font-futura text-[16px] leading-[23.4px] tracking-[0.3px] text-justify xl:max-w-[75%]">
								<strong>{openDaily}</strong>{" "}
								{card_flip_back?.meal_times || "N/A"}
							</span>
							<span className="font-futura text-[16px]  leading-[23.4px] tracking-[0.3px]">
								<strong>{dressCode}</strong>{" "}
								{card_flip_back?.dress_code || "N/A"}
							</span>
						</div>
					</div>
					<div className="flex flex-row justify-content-between gap-2 items-center mt-auto w-full">
						<div className="flex flex-row flex-wrap gap-2 justify-start items-center">
							{card_flip_back?.menu_buttons?.length > 0 &&
								card_flip_back.menu_buttons.map((menu_buttons, idx) => (
									<a
										key={idx}
										href={
											menu_buttons?.doc_menu?.external_link ||
											menu_buttons?.doc_menu?.pdf_menu_Upload?.url ||
											"/#"
										}
										target="_blank"
										rel="noopener noreferrer"
										className="border-2 overflow-hidden flex items-center justify-center group transition-colors duration-500 p-[12px] hover:bg-secondary hover:border-secondary"
									>
										<span className="group-hover:text-white">
											{menu_buttons?.button_text || "View Menu Link"}
										</span>
									</a>
								))}
						</div>

						{card_flip_back?.virtual_tour_url && (
							<a
								href={card_flip_back?.virtual_tour_url}
								target="_blank"
								rel="noopener noreferrer"
								className="bg-contain w-[90px] h-auto xl:ml-auto cursor-pointer"
							>
								<View360Icon size={70} />
							</a>
						)}
					</div>
				</div>
			),
			[basic_info, card_flip_back, dressCode, openDaily],
		);

		const containerClasses = [
			"w-full h-auto xl:min-w-[400px] xl:max-w-[500px] relative min-h-[550px] lg:min-h-[750px]",
			enable_card_flip ? "cursor-pointer" : "",
		]
			.filter(Boolean)
			.join(" ");

		return (
			<motion.div
				className={containerClasses}
				initial={{ opacity: 0, x: 50 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5, delay: index * 0.2 }}
				whileHover={
					enable_card_flip
						? {
								boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.4)",
								transition: { duration: 0.2 },
							}
						: {}
				}
			>
				{enable_card_flip ? (
					<FlipCard
						ref={refFlipCard}
						front={frontContent}
						classNamesBack="flex flex-col gap-[24px] px-[24px] pb-[24px]"
						back={backContent}
					/>
				) : (
					frontContent
				)}
			</motion.div>
		);
	},
);

ItemCardMenu.propTypes = {
	data: PropTypes.object,
	index: PropTypes.number,
	labels: PropTypes.object,
};

ItemCardMenu.displayName = "ItemCardMenu";

export default ItemCardMenu;
