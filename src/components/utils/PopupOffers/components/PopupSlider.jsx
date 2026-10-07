import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

const slideVariants = {
	enter: (direction) => ({
		opacity: 0,
		x: direction > 0 ? 44 : -44,
	}),
	center: {
		opacity: 1,
		x: 0,
	},
	exit: (direction) => ({
		opacity: 0,
		x: direction > 0 ? -44 : 44,
	}),
};

export default function PopupSlider({
	activeIndex,
	slideDirection,
	currentImage,
	currentOffer,
	isMobile,
}) {
	return (
		<AnimatePresence initial={false} mode="wait" custom={slideDirection}>
			<motion.div
				key={`${isMobile ? "mobile" : "desktop"}-image-${activeIndex}`}
				custom={slideDirection}
				variants={slideVariants}
				initial="enter"
				animate="center"
				exit="exit"
				transition={{ duration: 0.28, ease: "easeOut" }}
				className="popup-ads-next-image-layer absolute inset-0"
			>
				{currentImage?.url && (
					<Image
						src={currentImage.url}
						alt={currentImage.alt || currentImage.name || currentOffer?.title || "Offer"}
						fill
						sizes={isMobile ? "(max-width: 1023px) 100vw, 50vw" : "(max-width: 1023px) 100vw, 48vw"}
						className="object-cover"
						loading="lazy"
						fetchPriority="low"
					/>
				)}
			</motion.div>
		</AnimatePresence>
	);
}
