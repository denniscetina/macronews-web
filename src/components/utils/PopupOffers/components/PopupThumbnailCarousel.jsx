import { useEffect, useState } from "react";
import Image from "next/image";
import ChevronLeftIcon from "@/components/icons/ChevronLeft";
import ChevronRightIcon from "@/components/icons/ChevronRight";
import clsx from "clsx";

const TABLET_MEDIA_QUERY = "(min-width: 768px)";
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const THUMB_GAP_PX = 12;

const getVisibleThumbCount = () => {
	if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
		return 3;
	}

	if (window.matchMedia(DESKTOP_MEDIA_QUERY).matches) {
		return 3;
	}

	if (window.matchMedia(TABLET_MEDIA_QUERY).matches) {
		return 2;
	}

	return 1;
};

export default function PopupThumbnailCarousel({
	offers,
	activeIndex,
	goToIndex,
	goToPrevious,
	goToNext,
	getOfferThumbnail,
}) {
	const [visibleThumbCount, setVisibleThumbCount] = useState(getVisibleThumbCount);
	const visibleItemCount = Math.max(Math.min(visibleThumbCount, offers.length), 1);
	const maxStartIndex = Math.max(offers.length - visibleItemCount, 0);
	const carouselStartIndex = Math.min(activeIndex, maxStartIndex);
	const translatePercent = (carouselStartIndex * 100) / visibleItemCount;
	const translateGap = (carouselStartIndex * THUMB_GAP_PX) / visibleItemCount;

	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return undefined;
		}

		const tabletQuery = window.matchMedia(TABLET_MEDIA_QUERY);
		const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
		const updateVisibleThumbCount = () => {
			setVisibleThumbCount(getVisibleThumbCount());
		};

		updateVisibleThumbCount();

		if (typeof desktopQuery.addEventListener === "function") {
			tabletQuery.addEventListener("change", updateVisibleThumbCount);
			desktopQuery.addEventListener("change", updateVisibleThumbCount);

			return () => {
				tabletQuery.removeEventListener("change", updateVisibleThumbCount);
				desktopQuery.removeEventListener("change", updateVisibleThumbCount);
			};
		}

		tabletQuery.addListener(updateVisibleThumbCount);
		desktopQuery.addListener(updateVisibleThumbCount);

		return () => {
			tabletQuery.removeListener(updateVisibleThumbCount);
			desktopQuery.removeListener(updateVisibleThumbCount);
		};
	}, []);

	return (
		<div className="popup-ads-next-thumbs-row grid grid-cols-[auto_1fr_auto] items-center gap-1 border-t border-accent px-4 py-4 md:gap-2 md:px-6">
			<button
				type="button"
				onClick={goToPrevious}
				className="popup-ads-next-nav-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-transparent transition-colors duration-200 hover:border-secondary"
				aria-label="Previous offer"
			>
				<ChevronLeftIcon className="h-6 w-6 text-secondary" />
			</button>

			<div
				className="popup-ads-next-thumbs-viewport min-w-0 overflow-hidden"
				style={{
					"--popup-thumb-gap": `${THUMB_GAP_PX}px`,
					"--popup-thumb-visible": visibleItemCount,
				}}
			>
				<div
					className="popup-ads-next-thumbs-track flex gap-3 transition-transform duration-300 ease-out"
					style={{
						transform: `translateX(calc(-${translatePercent}% - ${translateGap}px))`,
					}}
				>
					{offers.map((offer, index) => {
						const thumbImage = getOfferThumbnail(offer);
						const cardClassName =
							index === activeIndex
								? " popup-ads-next-thumb-card-active border-secondary bg-white"
								: "";

						return (
							<button
								type="button"
								key={`${offer.title || "offer"}-${index}`}
								onClick={() => goToIndex(index)}
								aria-current={index === activeIndex ? "true" : undefined}
								className={`popup-ads-next-thumb-card grid h-[84px] shrink-0 grid-cols-[74px_1fr] items-center gap-2 rounded-lg border border-accent bg-alt p-2 text-left transition-colors duration-200 hover:border-secondary-hover/50 cursor-pointer ${cardClassName}`}
								style={{
									flexBasis:
										"calc((100% - (var(--popup-thumb-gap) * (var(--popup-thumb-visible) - 1))) / var(--popup-thumb-visible))",
								}}
							>
								<div className="popup-ads-next-thumb-image-wrap relative h-full w-full overflow-hidden rounded-md">
									{thumbImage?.url && (
										<Image
											src={thumbImage.url}
											alt={thumbImage.alt || thumbImage.name || offer.title || "Offer"}
											fill
											sizes="240px"
											className="object-cover"
										/>
									)}
								</div>

								<div className="popup-ads-next-thumb-content min-w-0">
									<p className="font-futura truncate text-[14px] uppercase leading-[130%] text-secondary">
										{offer.subtitle || offer.title}
									</p>
									{offer.description && (
										<div
											className={clsx(
												"popup-ads-next-thumb-description mt-1 line-clamp-2",
												"leading-[130%] text-[#6D7783] [&>p]:m-0 [&>p]:text-[12px] [&>p]:truncate",
												"[&>*]:!text-[12px] [&_p>strong]:!text-[12px] [&_p>strong]:text-shadow-[0_0_0.5px_currentColor] [&_p>strong]:font-medium"
											)}
											dangerouslySetInnerHTML={{ __html: offer.description }}
										/>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			<button
				type="button"
				onClick={goToNext}
				className={clsx(
					"popup-ads-next-nav-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center hover:border-secondary",
					"rounded-full border border-transparent transition-colors duration-200"
				)}
				aria-label="Next offer"
			>
				<ChevronRightIcon className="h-6 w-6 text-secondary" />
			</button>
		</div>
	);
}
