import Image from "next/image";
import clsx from "clsx";
import { sanitizeHtml } from "@/components/utils/SanitizeHtml/SanitizeHtml";
import CardImageWithTextButton from "./CardImageWithTextButton.client";
import DecorativeLeaves from "./DecorativeLeaves.client";
import BlurredImage from "../../utils/BlurredImage";

const MAIN_IMAGE_POSITIONS = new Set(["left", "right"]);

export default function CardImageWithText({ data, site }) {
	const safeData = data && typeof data === "object" ? data : {};
	const {
		background_image,
		decorativeElements,
		description = "",
		imagePosition = "right",
		showButton = false,
		titleInfo = "",
		buttonConfig = {},
		layoutVariant = "featured",
	} = safeData;

	const headLogo = site?.assets?.urm_icon_copper;
	const normalizedImagePosition =
		typeof imagePosition === "string" && MAIN_IMAGE_POSITIONS.has(imagePosition)
			? imagePosition
			: "right";
	const isImageRight = normalizedImagePosition === "right";
	const descriptionHtml = sanitizeHtml(description || "");
	const linkButton = buttonConfig?.linkButton;
	const decorativeElementItems =
		decorativeElements?.active && Array.isArray(decorativeElements.elements)
			? decorativeElements.elements.filter((element) => element?.elementStyle)
			: [];

	return (
		<section
            data-component="CardImageWithText"
			className={clsx(
				"relative overflow-visible w-full p-8 px-6 lg:py-16",
				layoutVariant === "compact" && "bg-[#FDFCFC] flex justify-center items-center"
			)}>
			<div
				className={clsx(
					"flex gap-8 lg:gap-12 flex-col lg:flex-row justify-center items-center",
					layoutVariant === "compact" && "h-full max-h-[560px] max-w-[1153px]"
				)}
			>
				<div
					className={clsx(
						"order-1 w-full relative z-2 overflow-hidden bg-center",
						isImageRight ? "lg:order-2" : "lg:order-1",
						layoutVariant === "compact"
							? "h-[360px]"
							: "h-[360px] md:h-[460px] lg:h-[560px] lg:max-w-[730px]"
					)}
				>
					<div className="w-full h-full overflow-hidden">
						{background_image?.url && (
							<BlurredImage
								src={background_image.url}
								alt={background_image.alt || titleInfo}
								fill
								sizes="(max-width: 1024px) 100vw, 730px"
								className="object-cover transition-transform duration-300 hover:scale-105"
							/>
						)}
					</div>
				</div>

				<div
					className={clsx(
						"order-2 flex flex-col items-center md:items-start justify-center h-full px-5 gap-8",
						isImageRight ? "lg:order-1" : "lg:order-2",
						layoutVariant === "compact" ? "max-h-[560px]" : "w-full max-w-[391px]"
					)}
				>
					<div className="w-full">
							{
								layoutVariant === "compact" ?
									<div className="flex justify-center items-center gap-4">
										{headLogo?.url && (
											<Image
												title={headLogo.title}
												src={headLogo.url}
												alt={headLogo.alt || ""}
												width={headLogo.width || 40}
												height={headLogo.height || 40}
												className="h-auto w-auto"
												unoptimized
											/>
										)}
										<div className="font-futura text-center text-[16px] lg:text-[20px] font-normal leading-5 tracking-[2.4px] uppercase">
											{titleInfo}
										</div>
								</div>
								:
								<h2 className="text-center text-secondary font-glosa font-medium text-2xl md:text-3xl lg:text-4xl leading-[120%] capitalize max-w-full break-words line-clamp-4">
									{titleInfo}
								</h2>


						}
					</div>
					<div
						className={clsx(
							"wysiwyg prose relative z-2",
							layoutVariant !== "compact" && "container-description-card"
						)}
						dangerouslySetInnerHTML={{ __html: descriptionHtml }}
					/>
					{showButton && (
						<CardImageWithTextButton
							button={linkButton}
							styleButton={buttonConfig.styleButton}
						/>
					)}
				</div>
			</div>
			<DecorativeLeaves
				elements={decorativeElementItems}
			/>
		</section>
	);
}
