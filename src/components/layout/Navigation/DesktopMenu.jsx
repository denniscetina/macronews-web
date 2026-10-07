import Link from "next/link";

function buildMenuHref(url) {
	const normalizedUrl = String(url || "").trim();

	if (!normalizedUrl) {
		return "/";
	}

	if (/^(https?:|mailto:|tel:)/i.test(normalizedUrl)) {
		return normalizedUrl;
	}

	return normalizedUrl.startsWith("/") ? normalizedUrl : `/${normalizedUrl}`;
}

function DropdownPanel({ items }) {
	if (!items || items.length === 0) {
		return null;
	}

	return (
		<div className="absolute top-full left-0 pt-2 z-50 min-w-[220px] opacity-0 invisible translate-y-1 pointer-events-none transition-all duration-200 ease-out group-hover/menu-item:opacity-100 group-hover/menu-item:visible group-hover/menu-item:translate-y-0 group-hover/menu-item:pointer-events-auto $group-focus-within/menu-item:opacity-100 $group-focus-within/menu-item:visible $group-focus-within/menu-item:translate-y-0 $group-focus-within/menu-item:pointer-events-auto">
			<ul className="bg-white shadow-lg border border-secondary/10 py-2">
				{items.map((child) => (
					<li key={`dropdown-${child.id}`}>
						<Link
							prefetch={false}
							href={buildMenuHref(child.url)}
							className="block px-6 py-3 font-futura text-secondary lg:text-xs xl:text-[13px] 1xl:text-sm tracking-[clamp(0.9px,0.11vw,2px)] uppercase hover:bg-accent transition-colors duration-200"
						>
							{child.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

function MenuItemWithDropdown({ item }) {
	const hasChildren = Array.isArray(item.children) && item.children.length > 0;

	return (
		<li className="group/menu-item relative">
			<Link
				href={buildMenuHref(item.url)}
				prefetch={false}
				className="group/menu-link font-futura flex flex-col gap-1 text-white group-[.active]/header:text-secondary group-[.active]/header:hover:text-primary transition-colors duration-100 uppercase whitespace-nowrap text-[clamp(12px,0.86vw,17px)] tracking-[clamp(0.9px,0.12vw,2px)]"
			>
				{item.label}
				<span className="transition-all duration-300 w-0 group-hover/menu-link:w-full h-px bg-white group-[.active]/header:bg-primary"></span>
			</Link>

			{hasChildren && <DropdownPanel items={item.children} />}
		</li>
	);
}

export default function DesktopMenu({ items = [], align = "end" }) {
	const justifyClass = align === "end" ? "justify-end" : "justify-start";

	return (
		<nav className="hidden lg:block" aria-label="Main navigation">
			<ul className={`flex items-center lg:gap-3 xl:gap-6 ${justifyClass}`}>
				{items.map((item) => (
					<MenuItemWithDropdown key={`desktop-menu-${item.id}`} item={item} />
				))}
			</ul>
		</nav>
	);
}
