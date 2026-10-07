"use client";

import { Children, Fragment, useMemo, useState } from "react";

const tabButtonClass =
	"header-6 px-2 font-futura cursor-pointer uppercase !leading-[16px] transition-all duration-300 !tracking-[2.4px] border-b-2 hover:text-primary-hover";
const activeTabsClass = "border-base3 pb-[8px] text-base3";
const inactiveTabsClass = "border-transparent pb-[8px] text-base3/50";

export default function RoomPostTabs({ tabs = [], children }) {
	const normalizedTabs = useMemo(
		() =>
			Array.isArray(tabs)
				? tabs.map((tab, index) => ({
						key: String(tab?.key ?? tab?.slug ?? tab?.name ?? index),
						label: tab?.label ?? tab?.name ?? tab,
					}))
				: [],
		[tabs],
	);
	const panels = Children.toArray(children);
	const [activeTab, setActiveTab] = useState(normalizedTabs[0]?.key || "");

	if (!normalizedTabs.length) {
		return null;
	}

	return (
		<div className="w-full flex flex-col gap-[64px]">
			<div
				className="w-full flex flex-row flex-wrap gap-[16px] justify-center items-center"
				role="tablist"
			>
				{normalizedTabs.map((tab, index) => {
					const isActive = tab.key === activeTab;

					return (
						<Fragment key={`room-post-tab-${tab.key}`}>
							<button
								id={`room-post-tab-${tab.key}`}
								aria-controls={`room-post-panel-${tab.key}`}
								aria-selected={isActive}
								className={`${tabButtonClass} ${isActive ? activeTabsClass : inactiveTabsClass}`}
								onClick={() => setActiveTab(tab.key)}
								role="tab"
								tabIndex={isActive ? 0 : -1}
								type="button"
							>
								{tab.label}
							</button>
							{index < normalizedTabs.length - 1 && (
								<div
									className="w-[1px] h-[35px] bg-base3/20 border-l-1"
									aria-hidden="true"
								/>
							)}
						</Fragment>
					);
				})}
			</div>
			<div className="w-full h-full flex flex-col justify-start items-stretch">
				{normalizedTabs.map((tab, index) => {
					const isActive = tab.key === activeTab;

					return (
						<div
							key={`room-post-panel-${tab.key}`}
							id={`room-post-panel-${tab.key}`}
							aria-labelledby={`room-post-tab-${tab.key}`}
							hidden={!isActive}
							role="tabpanel"
						>
							{panels[index]}
						</div>
					);
				})}
			</div>
		</div>
	);
}
