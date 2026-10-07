"use client";

import Image from "next/image";
import { useCallback, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CloseIcon from "@/components/icons/Close";
import UnicoLogo from "@/assets/img/unico-logo-riviera-maya-hotel.webp";
import PhoneButton from "@/components/layout/Navigation/PhoneButton";
import { AppContext } from "@/context/AppProvider";

export default function Drawer({ children }) {
	const { isDrawerOpen, closeDrawer, handleDrawerOpen } = useContext(AppContext);

	const handleMenuInteraction = useCallback(
		(event) => {
			const target = event.target;

			if (!(target instanceof Element)) {
				return;
			}

			const toggleButton = target.closest("[data-mobile-menu-toggle]");

			if (toggleButton) {
				const submenuId = toggleButton.getAttribute("aria-controls");
				const submenu = submenuId ? document.getElementById(submenuId) : null;
				const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
				const nextExpanded = !isExpanded;

				event.preventDefault();
				event.stopPropagation();
				toggleButton.setAttribute("aria-expanded", String(nextExpanded));

				const icon = toggleButton.querySelector("[data-mobile-toggle-icon]");
				if (icon) {
					icon.classList.toggle("rotate-180", nextExpanded);
				}

				if (submenu) {
					submenu.dataset.expanded = String(nextExpanded);
				}

				return;
			}

			if (target.closest("a")) {
				closeDrawer();
			}
		},
		[closeDrawer],
	);

	
	return (
		<div
			className={`drawer-menu relative z-[99] overflow-hidden transition-all duration-1000 ease-in-out ${
				isDrawerOpen ? "visible w-auto" : "invisible w-0"
			}`}
		>
			{/* Panel */}
			<div
				className={`fixed inset-0 w-[100vw] xl:w-[65vw] 2xl:w-[50vw] bg-alt flex flex-col p-6 lg:p-16 transition-all duration-500 ease-in-out ${
					isDrawerOpen
						? "opacity-100 z-[99] translate-x-0"
						: "opacity-0 translate-x-[-100%]"
				}`}
			>
				{/* Header */}
				<div className="relative flex items-center justify-center pb-6 lg:pb-12">
					<div className="absolute right-0">
						<button
							type="button"
							className="cursor-pointer hover:bg-accent rounded-full p-0.5"
							onClick={handleDrawerOpen}
							aria-label="Close menu"
						>
							<CloseIcon className="w-8 h-8" />
						</button>
					</div>

					<Image
						src={UnicoLogo}
						alt="Unico Hotel Riviera Maya"
						width={100}
						height={100}
					/>
				</div>

				{/* Body */}
				<div className="flex-1 min-h-0 py-0 lg:py-8 px-0 lg:px-32">
					<AnimatePresence mode="wait">
						<motion.div
							className="w-full h-full min-h-0"
							onClickCapture={handleMenuInteraction}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.4 }}
							key="links"
						>
							{children}
						</motion.div>
					</AnimatePresence>
				</div>

				{/* Footer (mobile only, links tab only) */}
				<div className="lg:hidden mt-auto pt-6 border-t border-secondary/20">
					<div className="flex flex-col gap-4">
						<PhoneButton variant="mobile" />
					</div>
				</div>
			</div>
		</div>
	);
}
