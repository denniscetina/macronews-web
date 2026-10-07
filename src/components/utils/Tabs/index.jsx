import { AnimatePresence, motion } from "framer-motion";
import PropTypes from "prop-types";
import { Fragment, useEffect, useMemo, useState } from "react";

export default function Tabs (props){
	const { listtabs = [], contentTabs = [], onchange } = props;
	const [activeTab, setActiveTab] = useState(listtabs[0] || 0);
	const handleTabClick = (index) => setActiveTab(index);

	const tabButtonClass = useMemo(
		() =>
			"header-6 px-2 font-futura cursor-pointer uppercase !leading-[16px] transition-all duration-300 !tracking-[2.4px] border-b-2 hover:text-primary-hover",
		[],
	);
	const activeTabsClass = "border-base3 pb-[8px] text-base3";
	const inactiveTabsClass = "border-transparent pb-[8px] text-base3/50";

	useEffect(() => {
		if (onchange) {
			onchange(activeTab);
		}
	}, [activeTab]);

	return (
		<div className="w-full flex flex-col gap-[64px]">
			<div className="w-full flex flex-row flex-wrap gap-[16px] justify-center items-center">
				{listtabs.length ? (
					listtabs.map((item, index) => {
						const itemLabel = item.label ?? item;
						const itemSlug = item.slug ?? item;
						return(
							<Fragment key={`tab-group-${index}`}>
								<button
									className={`${tabButtonClass} ${itemSlug === activeTab ? activeTabsClass : inactiveTabsClass}`}
									onClick={() => handleTabClick(itemSlug)}
									type="button"
									tabIndex={0}
								>
									{itemLabel}
								</button>
								{index < listtabs.length - 1 && (
									<div
										className="w-[1px] h-[35px] bg-base3/20 border-l-1"
										aria-hidden="true"
									/>
								)}
							</Fragment>
						)
					})
				)
					: null
				}
			</div>
			{listtabs.length && (
				<AnimatePresence mode="wait">
					{contentTabs && (
						<motion.div
							key={activeTab}
							initial={{ x: -50, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: 50, opacity: 0 }}
							transition={{ duration: 0.4, ease: "easeInOut" }}
							className="w-full h-full flex flex-col justify-start items-stretch"
						>
							{(() => {
								const foundTab = contentTabs.find(
									(item) => item.key === activeTab,
								);
								if (foundTab) {
									return foundTab.components;
								} else {
									return (
										<div className="w-full h-full flex flex-col justify-center items-center min-h-[200px]">
											<h3 className="header-5 text-center text-base3/50">
												Not found
											</h3>
										</div>
									);
								}
							})()}
						</motion.div>
					)}
				</AnimatePresence>
			)}
		</div>
	);
};

Tabs.propTypes = {
	listtabs: PropTypes.arrayOf(PropTypes.string),
	onchange: PropTypes.func,
	contentTabs: PropTypes.arrayOf(
		PropTypes.shape({
			key: PropTypes.string.isRequired,
			components: PropTypes.element.isRequired,
		}),
	),
};
