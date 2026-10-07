import Link from "next/link";
import BtnAnimated from "@/components/utils/ButtonAnimated/BtnAnimated";
// utils
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";
// Components
import CardFeatureImages from "./CardFeatureImages";

export default function ImageOverlayGrid({ data }) {
	const {
		backgroundColor,
		cardImages,
		logo,
		showButton,
		title,
		cardDescription,
		buttonConfiguration,
	} = data;
	const safeHtml = sanitizeHtml(cardDescription);
	const { buttonLink, positionButton, styleButton } = buttonConfiguration;
	const cardCount = cardImages?.length;

	return (
		<section
            data-component="ImageOverlayGrid"
			className={`relative overflow-hidden w-full h-auto flex flex-col items-center text-center p-8 px-6 lg:py-16 pb-20 min-h-[252px] ${backgroundColor ? "bg-accent" : "bg-alt"}`}
		>
			<div className="flex flex-col items-center text-center gap-3.5 mb-4 md:mb-8">
				{logo && (
					<img
						src={logo.url}
						alt={logo.alt || "logo"}
						className="relative lg:w-10 lg:h-10 w-8 h-8 mb-2"
					/>
				)}

				<h2 className="font-futura text-3xl md:text-3xl lg:text-3xl leading-[32px] text-[20px] text-secondary uppercase">
					{title}
				</h2>
				{cardDescription && (
					<div
						className="prose max-w-7xl text-sm sm:text-base md:text-lg"
						dangerouslySetInnerHTML={{ __html: safeHtml }}
					/>
				)}
			</div>
			{showButton && positionButton === "aboveImage" && (
				<BtnAnimated
					isExternalLink={true}
					styleButton={styleButton}
					button={buttonLink}
				/>
			)}
			<div
				className={`grid gap-10 pb-8 $px-6 ${
					cardCount === 1
						? "grid-cols-1"
						: cardCount === 2
							? "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto"
							: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
				}`}
			>
				{cardImages?.map((card, index) => {
					return (
						<div key={`card-feature-images-${index}`}>
							{card.cardLink ? (
								<Link
									key={`link-images${index}`}
									href={card.cardLink.url}
									target={card.cardLink.target || undefined}
									rel={card.cardLink.target ? "noopener noreferrer" : undefined}
								>
									<CardFeatureImages cardCount={cardCount} card={card} />
								</Link>
							) : (
								<CardFeatureImages cardCount={cardCount} card={card} />
							)}
						</div>
					);
				})}
			</div>
			{showButton && positionButton === "belowImage" && (
				<BtnAnimated
					isExternalLink={true}
					styleButton={styleButton}
					button={buttonLink}
				/>
			)}
		</section>
	);
}
