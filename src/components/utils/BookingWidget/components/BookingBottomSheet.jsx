"use client";

import { useEffect } from "react";
import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import CloseIcon from "@/components/icons/Close";

export default function BookingBottomSheet({
	isOpen,
	title,
	onClose,
	onApply,
	applyLabel = "Apply",
	isApplyDisabled = false,
	height = "auto",
	maxHeight = "75vh",
	children
}) {
	const openedAtRef = useRef(0);
	const handleBackdropClick = () => {
		if (Date.now() - openedAtRef.current < 120) {
			return;
		}

		onClose?.();
	};

	useEffect(() => {
		if (!isOpen || typeof document === "undefined") {
			return undefined;
		}

		openedAtRef.current = Date.now();

		const previousOverflow = document.documentElement.style.overflow;
		document.documentElement.style.overflow = "hidden";

		const onKeyDown = (event) => {
			if (event.key === "Escape") {
				onClose?.();
			}
		};

		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.documentElement.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isOpen, onClose]);

	if (typeof document === "undefined") {
		return null;
	}

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					key="booking-bottom-sheet-root"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2, ease: "easeInOut" }}
					className="fixed inset-0 z-[160]"
				>
					<div
						className="absolute inset-0 bg-black/55"
						onClick={handleBackdropClick}
					/>

					<motion.div
						initial={{ y: "100%" }}
						animate={{ y: 0 }}
						exit={{ y: "100%" }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						className="fixed inset-x-0 bottom-0 bg-alt rounded-t-[16px] shadow-2xl flex flex-col"
						style={{ height, maxHeight }}
						role="dialog"
						aria-modal="true"
						aria-label={title}
						onClick={(event) => event.stopPropagation()}
					>
						<div className="relative flex items-center justify-center p-4 border-b border-secondary/20">
							<p className="text-secondary font-futura uppercase tracking-[2px] text-[14px]">{title}</p>
							<button
								type="button"
								onClick={onClose}
								aria-label="Close modal"
								className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary rounded-full p-0.5 hover:bg-accent cursor-pointer"
							>
								<CloseIcon className="w-7 h-7" />
							</button>
						</div>

						<div className="booking-bottom-sheet-content flex flex-col flex-1 min-h-0 overflow-y-auto p-4">{children}</div>

						<div className="border-t border-secondary/20 p-4">
							<button
								type="button"
								onClick={onApply}
								disabled={isApplyDisabled}
								className="w-full h-[52px] bg-secondary text-white font-futura uppercase tracking-[2px] text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{applyLabel}
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body,
	);
}
