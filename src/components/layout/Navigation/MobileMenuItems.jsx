import Link from "next/link";

const LEVEL_PADDING_CLASSES = [
	"",
	"pl-4",
	"pl-8",
	"pl-12",
	"pl-16",
];

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

function getMenuItemKey(item, level) {
	return item?.id ?? `${level}-${item?.url ?? item?.label ?? "item"}`;
}

function ToggleIcon() {
	return (
		<span className="flex items-center justify-center w-4 h-4 text-secondary shrink-0">
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				aria-hidden="true"
				data-mobile-toggle-icon
				className="transition-transform duration-200"
			>
				<path
					d="M4 6.5 8 10 12 6.5"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</span>
	);
}

function MobileMenuItem({ item, level = 0 }) {
	const children = Array.isArray(item.children) ? item.children : [];
	const hasChildren = children.length > 0;
	const paddingLeft = LEVEL_PADDING_CLASSES[level] ?? LEVEL_PADDING_CLASSES.at(-1);
	const itemKey = getMenuItemKey(item, level);
	const submenuId = `mobile-submenu-${itemKey}`;

	const linkClassName = [
		"font-futura text-secondary text-lg tracking-widest uppercase line-clamp-1",
		paddingLeft,
	]
		.filter(Boolean)
		.join(" ");

	if (!hasChildren) {
		return (
			<li>
				<Link
					prefetch={false}
					href={buildMenuHref(item.url)}
					className={linkClassName}
				>
					<span title={item.label} className="line-clamp-1 tracking-[2px]">
						{item.label}
					</span>
				</Link>
			</li>
		);
	}

	return (
		<li>
			<div className="flex items-center justify-between gap-2">
				<Link
					prefetch={false}
					href={buildMenuHref(item.url)}
					className={`${linkClassName} flex-1 min-w-0`}
				>
					<span title={item.label} className="line-clamp-1 tracking-[2px]">
						{item.label}
					</span>
				</Link>

				<button
					type="button"
					aria-expanded="false"
					aria-controls={submenuId}
					data-mobile-menu-toggle
					className="cursor-pointer p-1 hover:bg-accent rounded"
				>
					<ToggleIcon />
				</button>
			</div>

			<ul
				id={submenuId}
				data-expanded="false"
				className="ml-4 flex flex-col gap-4 border-l border-secondary/20 pl-4 overflow-hidden transition-all duration-300 ease-out max-h-0 opacity-0 mt-0 pointer-events-none data-[expanded=true]:mt-3 data-[expanded=true]:max-h-[1200px] data-[expanded=true]:opacity-100 data-[expanded=true]:pointer-events-auto"
			>
				{children.map((child) => (
					<MobileMenuItem
						key={`mobile-item-${getMenuItemKey(child, level + 1)}`}
						item={child}
						level={level + 1}
					/>
				))}
			</ul>
		</li>
	);
}

export default function MobileMenuItems({ menu = [] }) {
	return (
		<nav className="overflow-y-auto h-full" aria-label="Mobile main navigation">
			<ul className="flex flex-col gap-6">
				{menu.map((item) => (
					<MobileMenuItem key={`mobile-menu-${getMenuItemKey(item, 0)}`} item={item} />
				))}
			</ul>
		</nav>
	);
}
