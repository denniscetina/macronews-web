import CardTextInfoFade from "./CardTextInfoFade.client";
import CardTextInfoParallax from "./CardTextInfoParallax.client";
import { sanitizeHtml } from "@/components/utils/SanitizeHtml/SanitizeHtml";
import { createElement } from "react";
import Image from "next/image";
//import "@/app/(styles)/typography.css";

const allowedTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

export default function CardTextInfo({ data }) {
	const safeData = data && typeof data === "object" ? data : {};
	const {
		contentInfo = {},
		decorativeElements,
		logoImage,
		iframeURL,
		renderIframe,
	} = safeData;
	const safeDescription = sanitizeHtml(contentInfo?.description || "");
	const rawTag = typeof contentInfo?.selectTypeTag === "string" ? contentInfo.selectTypeTag : "";
	const normalizedTag = rawTag.toLowerCase();
	const titleTagName = allowedTags.has(normalizedTag) ? normalizedTag : "h3";
	const elements =
		decorativeElements?.active && Array.isArray(decorativeElements.elements)
			? decorativeElements.elements.filter((element) => element?.elementStyle)
			: [];

	return (
		<section
			data-component="CardTextInfo"
			className="relative overflow-visible overflow-x-visible w-full h-auto bg-alt p-8 px-6 lg:py-16 $py-16 $px-8 $lg:py-[128px] min-h-[252px]"
		>
			<CardTextInfoParallax elements={elements} />

			<CardTextInfoFade>
				{logoImage?.url && (
					<Image
						src={logoImage.url}
						alt={logoImage.alt || "logo"}
						width={logoImage.width || 40}
						height={logoImage.height || 40}
						sizes="(max-width: 1024px) 32px, 40px"
						className="relative w-8 h-8 mb-2 lg:w-10 lg:h-10"
					/>
				)}

				{contentInfo?.title &&
					createElement(
						titleTagName,
						{
							className:
								"text-secondary font-glosa font-medium text-2xl md:text-3xl lg:text-4xl leading-tight capitalize pb-8",
						},
						contentInfo.title,
					)}

				<div
					className="prose prose-head max-w-5xl text-sm sm:text-base md:text-lg prose-p:font-futura prose-p:leading-[32px] prose-p:text-[20px] prose-p:text-secondary prose-p:font-normal"
					dangerouslySetInnerHTML={{ __html: safeDescription }}
				/>
			</CardTextInfoFade>

			{renderIframe && iframeURL && (
				<iframe
					style={{
						aspectRatio: "16/9",
						marginTop: "3rem",
					}}
					title={contentInfo?.title ?? ""}
					src={iframeURL}
					className="w-full max-w-[1190px] z-2 h-auto mx-auto"
					loading="lazy"
					referrerPolicy="no-referrer-when-downgrade"
				/>
			)}
		</section>
	);
}
