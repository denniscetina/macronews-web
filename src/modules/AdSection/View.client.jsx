"use client";

import AdPiece from "@/components/ads/AdPiece";
import { useAd } from "@/components/ads/useAd";
import SectionFrame from "@/components/ui/SectionFrame";

/** Frame and piece in one client component, so the frame disappears together with the piece when nothing fits. */
export default function View({ ads, lang, label, spacing, backgroundColor }) {
	const view = useAd(ads, { lang });
	if (!view) {
		return null;
	}
	return (
		<SectionFrame spacing={spacing} defaults={{ padding: { desktop: { top: "2rem", bottom: "2rem" }, mobile: { top: "1.5rem", bottom: "1.5rem" } } }} backgroundColor={backgroundColor}>
			<div className="mx-auto w-full max-w-[1280px] px-4 md:px-20">
				<AdPiece piece={view.piece} label={view.label || label} />
			</div>
		</SectionFrame>
	);
}
