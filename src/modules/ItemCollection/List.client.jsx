"use client";

import { useState } from "react";
import CmsImage from "@/components/ui/CmsImage";
import SiteLink from "@/components/ui/SiteLink";

/**
 * Items one under another, split by a line. Only one is active (the one the CMS marks, else none): clicking a row
 * (or Enter/Space on it) activates it and shows its button and image on the `imagePosition` side. Items with no
 * button or image can be activated too, only their highlight changes.
 * @param {{
 *   items: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"]["items"],
 *   showNumbering: boolean, imagePosition: "left" | "right", accent: string, dark: boolean,
 *   labels: { more: string, list: string },
 * }} props
 */
export default function List({ items, showNumbering, imagePosition, accent, dark, labels }) {
	const [active, setActive] = useState(() => {
		const marked = items.findIndex((item) => item.isActive);
		return marked >= 0 ? marked : null;
	});
	const current = active === null ? null : items[active];
	const image = current?.image.desktop ? current.image : null;
	const line = dark ? "border-white/15" : "border-[#e5e5e5]";
	return (
		<div className="grid items-start gap-8 md:grid-cols-2 md:gap-16">
			<ul aria-label={labels.list} className={`border-t ${line} ${imagePosition === "left" ? "md:order-2" : ""}`}>
				{items.map((item, index) => {
					const isActive = index === active;
					const Tag = item.level;
					return (
						<li key={`${index}-${item.title}`} className={`border-b ${line}`}>
							<Tag className="m-0">
								<button
									type="button"
									aria-expanded={isActive}
									onClick={() => setActive(index)}
									className="flex w-full items-baseline gap-4 pb-2 pt-6 text-left"
								>
									{showNumbering ? (
										<span
											className="w-8 shrink-0 font-display text-sm/7 font-bold motion-safe:transition-colors md:text-[28px]/7"
											style={{ color: isActive ? accent : undefined, opacity: isActive ? 1 : 0.4 }}
										>
											{String(index + 1).padStart(2, "0")}
										</span>
									) : null}
									<span
										className="font-display text-2xl/8 font-extrabold uppercase tracking-[-2px] motion-safe:transition-colors"
										style={{ color: isActive ? accent : undefined }}
									>
										{item.title}
									</span>
								</button>
							</Tag>
							{item.description || (isActive && item.cta) ? (
								<div className={showNumbering ? "pb-6 pl-12 md:pl-12" : "pb-6"}>
									{item.description ? <p className={`text-sm/5 ${dark ? "text-white/70" : "text-[#555552]"}`}>{item.description}</p> : null}
									{isActive && item.cta ? (
										<SiteLink
											href={item.cta.href}
											external={item.cta.external}
											target={item.cta.target ?? undefined}
											className="mt-4 inline-flex h-10 items-center px-5 text-sm/5 font-black uppercase tracking-[0.7px] text-white motion-safe:transition-opacity hover:opacity-90"
											style={{ backgroundColor: accent }}
										>
											{item.cta.label || labels.more}
										</SiteLink>
									) : null}
									{isActive && image ? (
										<div className="mt-6 overflow-hidden rounded-xl md:hidden">
											<CmsImage image={image} alt={image.alt} className="h-auto w-full" />
										</div>
									) : null}
								</div>
							) : null}
						</li>
					);
				})}
			</ul>
			<div className={`hidden md:block ${imagePosition === "left" ? "md:order-1" : ""}`}>
				{image ? (
					<div className="overflow-hidden rounded-xl">
						<CmsImage image={image} alt={image.alt} className="h-auto w-full" />
					</div>
				) : null}
			</div>
		</div>
	);
}
