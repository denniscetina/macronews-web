"use client";
// motion
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import ItemCardMenu from "./ItemCardMenu";
import { createTranslator } from "@/lib/i18n/translator";

const RestaurantMenuCard = ({ data, dict = {} }) => {
	const t = createTranslator(dict);
	const labels = {
		viewDetails: t("ItemCardMenu.btn_view_details", "View Details"),
		openDaily: t("ItemCardMenu.btn_open_daily", "Open Daily:"),
		dressCode: t("ItemCardMenu.lbl_dress_code", "Dress Code:"),
	};

	return (
		<section
            data-component="RestaurantMenuCard"
            className="pt-[80px] pb-[64px] container bg-base2">
			<div className="inner-container flex flex-col gap-[64px] justify-center items-center text-center">
				<motion.div
					className="flex flex-col gap-4 justify-center items-center"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.8 }}
				>
					<img
						className="bg-cover bg-center h-[34px] w-[34px]"
						src={data.icon_section.url}
						alt="icon rooms"
						loading="lazy"
					/>
					<h2 className="header-4 !font-futura !text-[32px] font-normal uppercase tracking-[2.4px] text-[#253746]">
						{data?.title}
					</h2>
				</motion.div>
				<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
					{data.list_restaurant_menu_card.length > 0 ? (
						data?.list_restaurant_menu_card?.map((item, index) => (
							<ItemCardMenu key={index} data={item} index={index} labels={labels} />
						))
					) : (
						null
					)}
				</div>
			</div>
		</section>
	);
};

RestaurantMenuCard.propTypes = {
	data: PropTypes.object,
	dict: PropTypes.object,
};

export default RestaurantMenuCard;
