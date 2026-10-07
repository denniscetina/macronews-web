"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useDictionaryScope } from "@/lib/i18n/ScopedDictionaryProvider";

const BookingWidgetMobileOverlay = dynamic(
	() => import("./BookingWidgetMobileOverlay.client"),
	{
		ssr: false,
		loading: () => null,
	},
);

const MOBILE_CTA_DELAY_MS = 1500;

export default function BookingWidgetMobileAction() {
	const { t = {} } = useDictionaryScope("utils.BookingWidget.MobileAction");
	const [isOpen, setIsOpen] = useState(false);
	const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);
	const [isButtonVisible, setIsButtonVisible] = useState(false);
	const [hasPainted, setHasPainted] = useState(false);
	const [hasInteracted, setHasInteracted] = useState(false);

	useEffect(() => {
		const id = requestAnimationFrame(() => setHasPainted(true));
		return () => cancelAnimationFrame(id);
	}, []);

	useEffect(() => {
		let timeoutId;

		const revealButton = () => {
			timeoutId = window.setTimeout(() => {
				setIsButtonVisible(true);
			}, MOBILE_CTA_DELAY_MS);
		};

		if (document.readyState === "complete") {
			revealButton();
		} else {
			window.addEventListener("load", revealButton, { once: true });
		}

		return () => {
			window.removeEventListener("load", revealButton);
			if (typeof timeoutId === "number") {
				window.clearTimeout(timeoutId);
			}
		};
	}, []);

	const shouldAnimate = hasPainted && hasInteracted

	const handleOpen = () => {
		setHasInteracted(true);
		setShouldRenderOverlay(true);
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	const handleExitComplete = () => {
		setShouldRenderOverlay(false);
	};

	return (
		<>
			<button
				type="button"
				className={clsx(
					"fixed inset-x-0 bottom-0 z-[90] w-full h-[56px] bg-secondary text-white border-t border-b border-alt drop-shadow-2xl font-futura text-[18px] font-bold leading-none tracking-[3px] uppercase cursor-pointer lg:hidden",
					shouldAnimate
						? [
							"block transition-[opacity, transform] duration-300 ease-out",
							isOpen
								? "opacity-0 translate-y-full pointer-events-none"
								: "opacity-100 translate-y-0",
						]
						: shouldRenderOverlay
							? "hidden"
							: isButtonVisible
								? "block"
								: "hidden",
				)}
				onClick={handleOpen}
				aria-expanded={isOpen}
				aria-label="Open booking widget"
			>
				{t.btn_action_book_now}
			</button>

			{shouldRenderOverlay && (
				<BookingWidgetMobileOverlay
					isOpen={isOpen}
					onClose={handleClose}
					onExitComplete={handleExitComplete}
				/>
			)}
		</>
	);
}
