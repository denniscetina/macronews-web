import Image from "next/image";
import BlurredImage from "../../utils/BlurredImage";

export default function CardFeatureImages({ cardCount, card }) {
	const hasLink = Boolean(card?.cardLink);
	const hasTitle = Boolean(card?.cardLink?.title);

	return (
		<div
			className={`overflow-hidden relative flex justify-center ${
				hasLink ? "group cursor-pointer" : ""
			}`}
		>
			<div
				className={`
                w-full overflow-hidden h-[360px] md:h-[460px] $lg:h-[560px] lg:max-w-[730px]
                ${
									cardCount === 1
										? "$w-full max-w-7xl"
										: cardCount === 2
											? "$w-full max-w-full aspect-4/3"
											: "w-full md:w-[355px] max-w-[355px] aspect-355/414"
								}
              `}
			>
				<BlurredImage
					src={card.featureImage.url}
					alt={card.featureImage.alt || card.featureImage.title || "Card image"}
					fill
					sizes={
						cardCount === 1
							? "(max-width: 1280px) 100vw, 1280px"
							: cardCount === 2
								? "(max-width: 1024px) 100vw, 50vw"
								: "(max-width: 1024px) 100vw, 355px"
					}
					className="w-full h-full object-cover overflow-hidden bg-center transition-transform duration-300 hover:scale-105"
				/>
			</div>
			{hasLink && (
				<>
					<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_69%)] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
					{hasTitle && (
						<div className="absolute bottom-8 sm:bottom-20 md:bottom-8 left-4 right-4 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
							<h3 className="font-glosa text-white font-bold text-lg md:text-base lg:text-lg leading-[20px] drop-shadow-md">
								{card.cardLink.title}
							</h3>
						</div>
					)}
				</>
			)}
		</div>
	);
}
