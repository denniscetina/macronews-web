"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ChevronLeftIcon from "@/components/icons/ChevronLeft";
import ChevronRightIcon from "@/components/icons/ChevronRight";
import CloseIcon from "@/components/icons/CloseIcon";
import PopupActions from "./components/PopupActions";
import PopupContent from "./components/PopupContent";
import PopupSlider from "./components/PopupSlider";
import PopupThumbnailCarousel from "./components/PopupThumbnailCarousel";
import usePopupOffers from "./hooks/usePopupOffers";
import usePopupSlider from "./hooks/usePopupSlider";
import usePopupVisibility from "./hooks/usePopupVisibility";

const getOfferImageByViewport = (offer, isMobileViewport) => {
	const image = offer?.image;

	if (!image) {
		return null;
	}

	if (isMobileViewport) {
		return image.mobileImage || image.tabletImage || image.desktopImage || null;
	}

	return image.desktopImage || image.tabletImage || image.mobileImage || null;
};

const getOfferThumbnail = (offer) => {
	const image = offer?.image;

	if (!image) {
		return null;
	}

	return image.desktopImage || image.mobileImage || image.tabletImage || null;
};

export default function PopupOffers() {
	const pathname = usePathname();
	const isHydrated = typeof window !== "undefined";
	const [isMobileViewport, setIsMobileViewport] = useState(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return false;
		}

		return window.matchMedia("(max-width: 767px)").matches;
	});

	useEffect(() => {
		if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
			return undefined;
		}

		const mediaQuery = window.matchMedia("(max-width: 767px)");

		const updateViewport = (event) => {
			setIsMobileViewport(event.matches);
		};

		if (typeof mediaQuery.addEventListener === "function") {
			mediaQuery.addEventListener("change", updateViewport);
			return () => {
				mediaQuery.removeEventListener("change", updateViewport);
			};
		}

		mediaQuery.addListener(updateViewport);

		return () => {
			mediaQuery.removeListener(updateViewport);
		};
	}, []);

	const { offers, popupTitle, popupDelay, logo } = usePopupOffers({
		pathname,
		shouldFetchOffers: isHydrated,
	});

	const totalOffers = offers.length;

	const {
		isSuppressed,
		visible: popupVisible,
		isClosing: popupClosing,
		shouldRenderPortal: shouldRender,
		closePopup: handleClose,
		handleExitComplete: onExitComplete,
	} = usePopupVisibility({
		isHydrated,
		isEnabled: totalOffers > 0,
		delayValue: popupDelay,
		resetKey: pathname,
	});

	const {
		activeIndex,
		slideDirection,
		goToIndex,
		goToNext,
		goToPrevious,
	} = usePopupSlider({
		totalItems: totalOffers,
		resetKey: pathname,
	});

	const currentOffer = offers[activeIndex] || null;
	const currentImage = getOfferImageByViewport(currentOffer, isMobileViewport);
	const imageFrameClassName = "popup-ads-next-desktop-image-frame w-full relative h-[250px]  md:h-full md:min-h-[320px] overflow-hidden";

	if (!isHydrated || !currentOffer || !shouldRender) {
		return null;
	}

	if (isSuppressed && !popupVisible && !popupClosing) {
		return null;
	}

	return createPortal(
		<AnimatePresence mode="wait" onExitComplete={onExitComplete}>
			{popupVisible && (
				<>
					<motion.button
						type="button"
						key="popup-ads-overlay"
						aria-label="Close popup"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="popup-ads-next-overlay fixed inset-0 z-[499] h-screen w-screen bg-white/0 backdrop-blur"
						onClick={handleClose}
					/>

					<motion.section
						key="popup-ads-dialog"
						role="dialog"
						aria-modal="true"
						aria-label="Special offers"
						initial={{ opacity: 0, scale: 0.96, y: 10 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 10 }}
						transition={{ duration: 0.2 }}
						className="popup-ads-next-dialog fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8"
					>
						<div
							className="popup-ads-next-card relative w-full max-w-[1170px] overflow-hidden bg-alt text-secondary shadow-[0_18px_44px_rgba(0,0,0,0.25)] max-[1023px]:max-w-[440px]"
							onClick={(event) => event.stopPropagation()}
						>
							<button
								type="button"
								className="popup-ads-next-close absolute right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent transition-opacity duration-200 hover:opacity-70 cursor-pointer border border-white backdrop-blur-sm md:rounded-none md:border-none"
								onClick={handleClose}
								aria-label="Close special offers"
							>
								<CloseIcon className="w-6 h-6 md:w-8 md:h-8 text-white md:text-secondary" />
							</button>

							<div className="popup-ads-next-desktop-layout flex h-full min-h-[560px] w-full flex-col">
								<div className="popup-ads-next-main-row grid flex-1 grid-cols-1 gap-4 p-0 md:gap-8 md:p-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
									<div className={imageFrameClassName}>
										<PopupSlider
											activeIndex={activeIndex}
											slideDirection={slideDirection}
											currentImage={currentImage}
											currentOffer={currentOffer}
											isMobile={isMobileViewport}
										/>
									</div>

									<div className="popup-ads-next-content flex flex-col gap-5 max-[1023px]:flex-1 max-[1023px]:gap-4 max-[1023px]:px-5 max-[1023px]:pt-4 max-[1023px]:pb-5">
										<PopupContent
											logo={logo}
											popupTitle={popupTitle}
											currentOffer={currentOffer}
											activeIndex={activeIndex}
											totalOffers={totalOffers}
											showCounter={!isMobileViewport}
										/>

										<PopupActions
											ctas={currentOffer?.ctas || []}
											className={""}
										/>

										{totalOffers > 1 && isMobileViewport && (
											<div className="popup-ads-next-mobile-pagination mt-1 flex items-center justify-center gap-5">
												<button
													type="button"
													onClick={goToPrevious}
													className="popup-ads-next-nav-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-transparent transition-colors duration-200 hover:border-secondary"
													aria-label="Previous offer"
												>
													<ChevronLeftIcon
														className="h-6 w-6 text-secondary"
														size={10}
													/>
												</button>
												<span className="font-glosa mt-1 shrink-0 text-lg text-[#5C6974]">{`${activeIndex + 1} / ${totalOffers}`}</span>
												<button
													type="button"
													onClick={goToNext}
													className="popup-ads-next-nav-btn inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-transparent transition-colors duration-200 hover:border-secondary"
													aria-label="Next offer"
												>
													<ChevronRightIcon
														className="h-6 w-6 text-secondary"
														size={10}
													/>
												</button>
											</div>
										)}
									</div>
								</div>

								{totalOffers > 1 && !isMobileViewport && (
									<PopupThumbnailCarousel
										offers={offers}
										activeIndex={activeIndex}
										goToIndex={goToIndex}
										goToPrevious={goToPrevious}
										goToNext={goToNext}
										getOfferThumbnail={getOfferThumbnail}
									/>
								)}
							</div>
						</div>
					</motion.section>
				</>
			)}
		</AnimatePresence>,
		document.body,
	);
}
