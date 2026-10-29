"use client";

import { useState } from "react";
import CmsImage from "@/components/ui/CmsImage";
import SiteLink from "@/components/ui/SiteLink";

// Figma Cinematic_Directory_List / Directory_Row. The image box is 371 wide and does not push the row (the active row
// is 220px tall and the image is centered on it). Height 180px by request (Figma draws 241 for the box, ~132 for the art).
const IMAGE = { width: 371, height: 241 };

/**
 * Items one under another, each with a 1px #E5E5E5 line below. Only one is active (the one the CMS marks on load, else none):
 * clicking a row's title (or Enter/Space on it) activates it and shows its button and image. The image goes on the
 * `imagePosition` side (Figma only draws the right one) and, on mobile, under the text (not drawn in Figma either).
 * Items with no button or image can be activated too, only their highlight changes.
 * @param {{
 *   items: ReturnType<typeof import("@/server/cms/mappers/sections").mapSections>[number]["data"]["items"],
 *   showNumbering: boolean, imagePosition: "left" | "right", accent: string, dark: boolean,
 *   labels: { more: string, list: string },
 * }} props
 */
export default function List({ items, showNumbering, imagePosition, accent, dark, labels }) {
	// The item the CMS marks (`isActive`) opens active; with none marked, none is (the core spec).
	const [active, setActive] = useState(() => {
		const marked = items.findIndex((item) => item.isActive);
		return marked >= 0 ? marked : null;
	});
	// Figma draws the 1px line inside the row (it does not add height): an inset shadow does the same.
	const line = dark ? "rgb(255 255 255 / 0.15)" : "#e5e5e5";
	const left = imagePosition === "left";
	return (
		<ul aria-label={labels.list}>
			{items.map((item, index) => {
				const isActive = index === active;
				const Tag = item.level;
				const image = isActive ? item.image.desktop : null;
				return (
					<li key={`${index}-${item.title}`} style={{ boxShadow: `inset 0 -1px 0 0 ${line}` }}
						className={`relative flex ${isActive ? "md:min-h-[220px]" : ""} ${left && image ? "md:pl-[371px]" : ""}`}>
						{showNumbering ? (
							<span
								className="w-11 shrink-0 pb-6 pt-6 font-display text-sm/7 md:pb-8 md:pt-8"
								style={{ color: isActive ? accent : dark ? "var(--color-white)" : "var(--color-macro-black)", opacity: isActive ? 1 : 0.33, fontWeight: isActive ? 600 : 500 }}
								aria-hidden="true"
							>
								{String(index + 1).padStart(2, "0")}
							</span>
						) : null}
						<div className="flex min-w-0 flex-1 flex-col gap-3 py-6 pl-0 pr-0 md:py-8 md:pl-4 md:pr-12">
							<Tag className="m-0">
								<button type="button" aria-expanded={isActive} onClick={() => setActive(index)} className="text-left">
									<span
										className="block font-display text-2xl/[normal] font-extrabold uppercase tracking-[-2px] motion-safe:transition-colors"
										style={{ color: isActive ? accent : dark ? "var(--color-white)" : "var(--color-ink)" }}
									>
										{item.title}
									</span>
								</button>
							</Tag>
							{item.description ? (
								<p className={`text-sm ${isActive ? "max-w-[703px] leading-[22px]" : "leading-5"} ${dark ? "text-white/70" : "text-[#555552]"}`}>{item.description}</p>
							) : null}
							{isActive && item.cta ? (
								<SiteLink
									href={item.cta.href}
									external={item.cta.external}
									target={item.cta.target ?? undefined}
									className="inline-flex h-8 w-fit items-center gap-2 rounded-lg px-2 py-1 font-display text-sm/6 font-medium tracking-[-0.18px] text-white motion-safe:transition-opacity hover:opacity-90"
									style={{ backgroundColor: accent }}
								>
									{item.cta.label || labels.more}
									<svg aria-hidden="true" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
										<path d="M5 12h14M12 5l7 7-7 7" />
									</svg>
								</SiteLink>
							) : null}
							{image ? (
								<CmsImage image={image} alt={image.alt} width={IMAGE.width} height={IMAGE.height} className="mt-3 h-[180px] w-full max-w-[371px] object-contain object-left opacity-75 md:hidden" />
							) : null}
						</div>
						{image ? (
							<div className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 md:block ${left ? "left-0" : "right-0"}`}>
								<CmsImage image={image} alt={image.alt} width={IMAGE.width} height={IMAGE.height} className="h-[180px] w-[371px] object-contain object-right opacity-75" />
							</div>
						) : null}
					</li>
				);
			})}
		</ul>
	);
}
