"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const BookingWidgetMobileOverlay = dynamic(
	() => import("./BookingWidgetMobileOverlay.client"),
	{
		ssr: false,
		loading: () => null,
	},
);

export default function BookingWidgetMobileActionClient({
	label,
	ariaLabel,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [shouldRenderOverlay, setShouldRenderOverlay] = useState(false);

	const handleOpen = () => {
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
				className={[
					"fixed inset-x-0 bottom-0 z-[90] block h-[56px] w-full border-t border-b border-alt bg-secondary text-white drop-shadow-2xl lg:hidden",
					"font-futura text-[18px] font-bold uppercase leading-none tracking-[3px]",
					"cursor-pointer transition-[opacity,transform] duration-300 ease-out",
					isOpen
						? "translate-y-full opacity-0 pointer-events-none"
						: "translate-y-0 opacity-100",
				].join(" ")}
				onClick={handleOpen}
				aria-expanded={isOpen}
				aria-label={ariaLabel}
			>
				{label}
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
