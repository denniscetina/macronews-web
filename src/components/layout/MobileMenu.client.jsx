"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SiteLink from "@/components/ui/SiteLink";

function Items({ items, depth = 0 }) {
	return (
		<ul className={depth ? "ml-4 border-l border-white/20 pl-4" : ""}>
			{items.map((item, index) => (
				<li key={item.id ?? index} className="py-1">
					<SiteLink href={item.href} external={item.external} target={item.target ?? undefined} className="block py-1.5 text-sm font-bold uppercase tracking-[0.1em]">
						{item.label}
					</SiteLink>
					{item.children.length > 0 ? <Items items={item.children} depth={depth + 1} /> : null}
				</li>
			))}
		</ul>
	);
}

/** Hamburger button + drawer for small screens. Closes on navigation and on Escape. */
export default function MobileMenu({ items, labels }) {
	// The menu is "open" only on the page where it was opened, so navigating closes it.
	const pathname = usePathname();
	const [openAt, setOpenAt] = useState(null);
	const open = openAt === pathname;
	const setOpen = (value) => setOpenAt(value ? pathname : null);

	useEffect(() => {
		if (!open) {
			return undefined;
		}
		const onKeyDown = (event) => event.key === "Escape" && setOpenAt(null);
		document.addEventListener("keydown", onKeyDown);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = "";
		};
	}, [open]);

	if (items.length === 0) {
		return null;
	}

	return (
		<div className="lg:hidden">
			<button type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(!open)} className="rounded border border-white/50 px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-surface hover:text-white">
				{open ? labels.close : labels.open}
			</button>
			<nav id="mobile-menu" aria-label={labels.nav} hidden={!open} className="absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto bg-ink px-4 py-4 text-surface shadow-lg">
				<Items items={items} />
			</nav>
		</div>
	);
}
