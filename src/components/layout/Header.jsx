import Logo from "./Logo";
import DesktopMenu from "./DesktopMenu.client";
import HeaderShell from "./HeaderShell.client";
import MobileMenu from "./MobileMenu.client";

/**
 * Header with two looks (Figma Header, Mode=Overlay | Sticky): transparent over a hero at the top of the page
 * (105px, big logo) and red and 79px once the page is scrolled. The transparent one only applies when the page starts
 * with a section that marks itself with `data-header-overlay` (the hero); any other page starts red. The styles are
 * `.site-header*` in globals.css. A 0-high sticky wrapper keeps the header out of the flow, so the hero slides under it.
 * @param {{ lang: string, name: string, logo: any, logoOnDark: any, menu: any[], dictionary: any }} props
 */
export default function Header({ lang, name, logo, logoOnDark, menu, dictionary }) {
	const { layout, modules } = dictionary;
	return (
		<div className="sticky top-0 z-40 h-0">
			<HeaderShell className="site-header absolute inset-x-0 top-0">
				<div className="container-site site-header-bar flex items-center justify-between gap-6">
					<Logo lang={lang} name={name} logo={logo} logoOnDark={logoOnDark} className="site-logo" />
					<div className="flex items-center gap-4 sm:gap-8">
						<DesktopMenu items={menu} label={layout.mainNav} lang={lang} agoLabels={modules.news.ago} />
						<MobileMenu items={menu} labels={{ open: layout.openMenu, close: layout.closeMenu, nav: layout.mainNav }} />
					</div>
				</div>
			</HeaderShell>
		</div>
	);
}
