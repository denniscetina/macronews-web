
import Link from "next/link";
//import BlurredImage from "@/components/utils/BlurredImage";
import Image from "next/image";
const BtnAction = ({ handleFlipped, card }) => {
	return (
		<button
			type="button"
			aria-label="chevron-left"
			className="flex h-8 pt-8 justify-start items-center cursor-pointer gap-2 font-futura font-[700] text-[18px] leading-[23.4px] tracking-[0.3px] group"
			onClick={handleFlipped}
		>
			<span className="body-medium tracking-[0.3px] group-hover:text-primary transition-colors duration-300">
				{card.textButtonDetail}
			</span>
			<div
				aria-hidden="true"
				className="
					w-6 h-6 bg-secondary 
                    group-hover:translate-x-2 group-hover:bg-primary
                    transition-all duration-300
                    [mask:url('@/assets/img/chevron-left.svg?react')]
                    mask-center mask-no-repeat mask-size-contain
				"
			/>
		</button>
	);
};

const CardImage = ({ cardCount, card, handleFlipped }) => {
	return (
		<div className="relative flex justify-center">
			<div className="flex w-full flex-col items-start max-h-[454px] h-[454px] md:max-h-[670px] lg:max-h-[670px] lg:h-[670px]">
				<div className="w-full h-full">
					<div className="w-full relative overflow-hidden">
						<div
							className={`
                        w-full relative overflow-hidden 
                        transition-transform duration-300 hover:scale-105
                        ${
													cardCount === 1
														? "max-w-5xl h-[327px] md:h-[543px]"
														: cardCount === 2
															? "h-[327px] lg:h-[543px] aspect-[4/3]"
															: "max-w-[327px] h-[327px] aspect-[327/327] md:max-w-[465px] md:aspect-[465/543] lg:h-[543px]"
												}
                      `}
							onClick={() => (card.renderCardDetail ? handleFlipped() : {})}
						>
							<Image
								src={card.featureImage.url}
								alt={
									card.featureImage.alt ||
									card.featureImage.title ||
									"Card image"
								}
								width={465}
								height={543}
								className={`w-full h-full object-cover object-center ${card.renderDetail && "group cursor-pointer"}`}
							/>
						</div>
					</div>
					<div className="pt-8 pl-2 flex flex-col items-start w-full h-[95px] gap-2">
						<div>
							<div className="flex flex-col items-start w-full h-[44px]">
								<h4 className="text-secondary header-base capitalize">
									{card.titleFeatureImage}
								</h4>
								<h3 className="text-secondary body-medium capitalize tracking-[2.4px]">
									{card.descriptionFeatureImage}
								</h3>
							</div>
							{card.renderCardDetail ? (
								<BtnAction handleFlipped={handleFlipped} card={card} />
							) : (
								<Link
									href={card.linkRedirectToPage?.url || "/#"}
									target={card.linkRedirectToPage?.target || undefined}
									rel={card.linkRedirectToPage?.target ? "noopener noreferrer" : undefined}
								>
									<BtnAction card={card} />
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CardImage;
