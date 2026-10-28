"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import SiteLink from "@/components/ui/SiteLink";
import MegaMenu from "./MegaMenu";

/**
 * Desktop menu of the header. An item with `mega` is a button that opens its mega menu on click (Figma: "Al hacer clic
 * -> Overlay, Open"); it closes with Escape, with a click outside, or when the page changes. An item with `children`
 * but no `mega` keeps the simple dropdown; the rest are links.
 */
export default function DesktopMenu({ items, label, lang, agoLabels, megaLabels }) {
	const pathname = usePathname();
	const baseId = useId();
	const [openAt, setOpenAt] = useState(null); // { key, path }
	const root = useRef(null);
	const open = openAt?.path === pathname ? openAt.key : null;
	const active = items.find((item, index) => `${baseId}-${index}` === open);

	useEffect(() => {
		if (!open) {
			return undefined;
		}
		const onKey = (event) => {
			if (event.key === "Escape") {
				setOpenAt(null);
				root.current?.querySelector("[aria-expanded='true']")?.focus();
			}
		};
		const onPointer = (event) => {
			if (!root.current?.contains(event.target)) {
				setOpenAt(null);
			}
		};
		document.addEventListener("keydown", onKey);
		document.addEventListener("pointerdown", onPointer);
		return () => {
			document.removeEventListener("keydown", onKey);
			document.removeEventListener("pointerdown", onPointer);
		};
	}, [open]);

	if (items.length === 0) {
		return null;
	}

	return (
		<nav ref={root} aria-label={label} className="hidden lg:block">
			<ul className="flex items-center gap-6">
				{items.map((item, index) => {
					const key = `${baseId}-${index}`;
					const isOpen = open === key;
					return (
						<li key={item.id ?? index} className="group relative">
							{item.mega ? (
								<button
									type="button"
									aria-expanded={isOpen}
									aria-controls={`${key}-mega`}
									onClick={() => setOpenAt(isOpen ? null : { key, path: pathname })}
									className={`site-nav-item inline-block py-5 ${isOpen ? "is-open" : ""}`}
								>
									{item.label}
								</button>
							) : (
								<SiteLink href={item.href} external={item.external} target={item.target ?? undefined} tabIndex={item.href ? undefined : 0} className="site-nav-item inline-block py-5">
									{item.label}
								</SiteLink>
							)}
							{!item.mega && item.children.length > 0 ? (
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
					);
				})}
			</ul>
			{active?.mega ? (
				<div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2">
					<MegaMenu mega={active.mega} lang={lang} agoLabels={agoLabels} labels={megaLabels} id={`${open}-mega`} label={active.label} />
				</div>
			) : null}
		</nav>
	);
}
