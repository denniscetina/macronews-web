import Header from "@/components/layout/Navigation/Header";
import Drawer from "@/components/layout/Navigation/Drawer";
import HeaderWrapper from "@/components/layout/Navigation/HeaderWrapper";
import MobileMenuItems from "@/components/layout/Navigation/MobileMenuItems";

const MAX_MENU_ITEMS = 8;

function splitMenu(menu = []) {
	const items = menu.slice(0, MAX_MENU_ITEMS);
	const midpoint = Math.ceil(items.length / 2);

	return {
		leftMenu: items.slice(0, midpoint),
		rightMenu: items.slice(midpoint),
	};
}

export default function Navigation({
	menu,
	languages,
	site,
	headerSentinelVh = 80,
}) {
	const { leftMenu, rightMenu } = splitMenu(menu);
	return (
		<>
			<HeaderWrapper languages={languages} sentinelVh={headerSentinelVh}>
				<Header
					leftMenu={leftMenu}
					rightMenu={rightMenu}
					site={site}
					languages={languages}
				/>
			</HeaderWrapper>
			<Drawer>
				<MobileMenuItems menu={menu} />
			</Drawer>
		</>
	);
}
