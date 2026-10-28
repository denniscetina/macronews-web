import SiteLink from "@/components/ui/SiteLink";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu.client";

const itemClass = "text-xs font-bold uppercase tracking-[0.1em] text-surface hover:text-white focus-visible:text-white";

function DesktopMenu({ items, label }) {
	if (items.length === 0) {
		return null;
	}
	return (
		<nav aria-label={label} className="hidden lg:block">
			<ul className="flex items-center gap-8">
				{items.map((item, index) => (
					<li key={item.id ?? index} className="group relative">
						<SiteLink href={item.href} external={item.external} target={item.target ?? undefined} tabIndex={item.href ? undefined : 0} className={`inline-block py-5 ${itemClass}`}>
							{item.label}
						</SiteLink>
						{item.children.length > 0 ? (
							<ul className="invisible absolute left-1/2 top-full z-50 min-w-56 -translate-x-1/2 rounded-xl bg-white py-2 opacity-0 shadow-[0_8px_10px_-6px_rgba(0,0,0,0.4)] transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
								{item.children.map((child, childIndex) => (
									<li key={child.id ?? childIndex}>
										<SiteLink href={child.href} external={child.external} target={child.target ?? undefined} className="block px-5 py-2 text-xs font-medium uppercase tracking-wide text-charcoal hover:text-primary">
											{child.label}
										</SiteLink>
									</li>
								))}
							</ul>
						) : null}
					</li>
				))}
			</ul>
		</nav>
	);
}

/**
 * Sticky red bar (79px): logo, `main_menu` (desktop) and the hamburger drawer (mobile).
 * @param {{ lang: string, name: string, logo: any, logoOnDark: any, menu: any[], dictionary: any }} props
 */
export default function Header({ lang, name, logo, logoOnDark, menu, dictionary }) {
	const { layout } = dictionary;
	return (
		<header className="sticky top-0 z-40 bg-primary">
			<div className="container-site flex h-[79px] items-center justify-between gap-6">
				<Logo lang={lang} name={name} logo={logo} logoOnDark={logoOnDark} />
				<div className="flex items-center gap-4 sm:gap-8">
					<DesktopMenu items={menu} label={layout.mainNav} />
					<MobileMenu items={menu} labels={{ open: layout.openMenu, close: layout.closeMenu, nav: layout.mainNav }} />
				</div>
			</div>
		</header>
	);
}
