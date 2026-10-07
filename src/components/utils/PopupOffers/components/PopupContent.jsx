import Image from "next/image";
import clsx from "clsx";
export default function PopupContent({
	logo,
	popupTitle,
	currentOffer,
	activeIndex,
	totalOffers,
	showCounter,
}) {
	return (
		<>
			<div className="popup-ads-next-header-row mb-4 flex items-start justify-between gap-3 pt-0 md:pt-8">
				<div className="popup-ads-next-title-wrap flex items-center gap-3">
					{logo?.url && (
						<Image
							fetchPriority="low"
							src={logo.url}
							alt={logo.alt || logo.name || "Logo"}
							width={logo.width || 34}
							height={logo.height || 33}
							className="popup-ads-next-logo h-auto w-auto max-h-[32px] max-w-[40px] object-contain"
						/>
					)}
					<h2 className="font-glosa text-2xl md:text-3xl leading-[120%] text-secondary">{popupTitle}</h2>
				</div>

				{showCounter && (
					<span>{`${activeIndex + 1} / ${totalOffers}`}</span>
				)}
			</div>

			<h3 className="font-futura text-lg md:text-xl font-medium uppercase leading-[120%] text-secondary">{currentOffer?.subtitle}</h3>

			{currentOffer?.description && (
				<div
					className={clsx(
						"popup-ads-next-description pr-1 font-futura text-base leading-[165%] text-[#5C6974]",
						"[&>p>strong]:font-medium [&>p>strong]:text-shadow-[0_0_0.5px_currentColor]",
						"[&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:my-2 [&>ul]:list-disc [&>ul]:space-y-1 [&>ul]:pl-5 [&_li]:text-[#5C6974]",
						"max-[1023px]:max-h-[104px] max-[1023px]:text-[29px] max-[1023px]:leading-[150%]"
					)}
					dangerouslySetInnerHTML={{ __html: currentOffer.description }}
				/>
			)}
		</>
	);
}
