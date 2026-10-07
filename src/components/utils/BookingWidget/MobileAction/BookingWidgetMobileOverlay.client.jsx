"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import Image from "next/image";
import CloseIcon from "@/components/icons/Close";
import BookingWidgetMobile from "../BookingWidgetMobile";
import UnicoLogo from "@/assets/img/unico-logo-riviera-maya-hotel.webp";

export default function BookingWidgetMobileOverlay({
	isOpen,
	onClose,
	onExitComplete,
}) {
	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const previousOverflow = document.documentElement.style.overflow;
		document.documentElement.style.overflow = "hidden";

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.documentElement.style.overflow = previousOverflow;
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (typeof document === "undefined") {
		return null;
	}

	return createPortal(
		<AnimatePresence onExitComplete={onExitComplete}>
			{isOpen && (
				<motion.div
					key="booking-mobile-overlay"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2, ease: "easeInOut" }}
					className="fixed inset-0 z-[130] lg:hidden"
				>
					<div className="absolute inset-0 bg-black/60" onClick={onClose} />

					<motion.div
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ duration: 0.35, ease: "easeInOut" }}
						className="relative h-full w-full bg-alt flex flex-col p-6"
					>
						<div className="relative flex items-center justify-center pb-6">
							<Image
								src={UnicoLogo}
								alt="Unico Hotel Riviera Maya"
								width={100}
								height={100}
							/>
							<button
								type="button"
								onClick={onClose}
								className="absolute right-0 rounded-full p-0.5 text-secondary hover:bg-accent cursor-pointer"
								aria-label="Close booking widget"
							>
								<CloseIcon className="w-8 h-8" />
							</button>
						</div>

						<div className="flex-1 min-h-0 py-0 px-0">
							<BookingWidgetMobile className="h-full" />
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}
