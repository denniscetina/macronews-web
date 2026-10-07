"use client";

import PropTypes from "prop-types";
import CardGallery from "./CardGallery";
import { createTranslator } from "@/lib/i18n/translator";

ImageOverlayGridRotating.propTypes = {
	data: PropTypes.object,
	dict: PropTypes.object,
};
export default function ImageOverlayGridRotating({ data, dict = {} }) {
	const t = createTranslator(dict);
	const { logo, title, cardImages, backgroundColor } = data;
	const labels = {
		close: t("CardDetail.btn_close", "Close"),
	};

	return (
		<section
			data-component="ImageOverlayGridRotating"
			className={`relative overflow-visible w-full h-auto flex flex-col items-center max-md:py-16 max-md:px-6 text-center pt-16 px-6 pb-20 min-h-[252px] ${backgroundColor ? "bg-base1" : "bg-alt"}`}
		>
			<div className="flex flex-col items-center text-center gap-[14px] $py-8 $px-6">
				{logo && (
					<img
						src={logo.url}
						alt={logo.alt || "logo"}
						className="relative lg:w-10 lg:h-10 w-8 h-8 mb-2"
					/>
				)}

				<h4 className="font-futura text-3xl md:text-3xl lg:text-3xl leading-[32px] text-[20px] text-secondary uppercase">
					{title}
				</h4>
			</div>
			<CardGallery cardImages={cardImages} labels={labels} />
		</section>
	);
}
