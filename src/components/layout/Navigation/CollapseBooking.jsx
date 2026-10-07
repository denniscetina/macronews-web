"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useHeaderState } from "@/components/layout/Navigation/HeaderStateContext";
import { useDictionaryScope } from "@/lib/i18n/ScopedDictionaryProvider";

const PORTAL_ROOT_ID = "header-booking-widget-root";
const loadBookingWidgetHero = () =>
	import("@/components/utils/BookingWidget/BookingWidgetHero").then(
		(module) => module.default,
	);

export default function CollapseBooking({ isHeaderActive: isHeaderActiveProp }) {
	const { t = {} } = useDictionaryScope("layout.Navigation.CollapseBooking");
	const { isHeaderActive: isHeaderActiveFromContext = false } = useHeaderState();
	const isHeaderActive =
		typeof isHeaderActiveProp === "boolean"
			? isHeaderActiveProp
			: isHeaderActiveFromContext;
	const [isOpen, setIsOpen] = useState(false);
	const [BookingWidgetHero, setBookingWidgetHero] = useState(null);
	const isHydrated = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const portalRoot =
		isHydrated && typeof document !== "undefined"
			? document.getElementById(PORTAL_ROOT_ID)
			: null;

	const isPanelOpen = isOpen && isHeaderActive;

	useEffect(() => {
		if (!isPanelOpen || BookingWidgetHero) {
			return;
		}

		let isMounted = true;

		loadBookingWidgetHero().then((Component) => {
			if (isMounted) {
				setBookingWidgetHero(() => Component);
			}
		});

		return () => {
			isMounted = false;
		};
	}, [BookingWidgetHero, isPanelOpen]);

	useEffect(() => {
		if (!isHeaderActive) {
			const timeoutId = window.setTimeout(() => setIsOpen(false), 0);
			return () => window.clearTimeout(timeoutId);
		}
	}, [isHeaderActive]);

	const panelClassName = useMemo(() => {
		const baseClasses =
			"w-full transition-all duration-300 ease-out flex justify-center";

		if (isPanelOpen) {
			return `${baseClasses} max-h-[420px] opacity-100 translate-y-0 pointer-events-auto`;
		}

		return `${baseClasses} max-h-0 opacity-0 -translate-y-3 pointer-events-none`;
	}, [isPanelOpen]);

	return (
		<>
			<div className="hidden lg:flex justify-center w-full transition-all duration-300 ease-in-out opacity-0 invisible group-[.active]/header:opacity-100 group-[.active]/header:visible">
				<div className="w-full max-w-[2560px]">
					<button
						type="button"
						aria-expanded={isPanelOpen}
						aria-controls="header-booking-widget-panel"
						onClick={() => {
							if (!isHeaderActive) {
								return;
							}

							setIsOpen((prev) => !prev);
						}}
						className=" cursor-pointer transition-colors duration-300 ease-in-out bg-secondary text-white px-6 py-3 w-full uppercase font-futura tracking-[2px] hover:bg-secondary-hover"
					>
						{isPanelOpen ? t.lbl_close : t.btn_action_book_now}
					</button>
				</div>
			</div>
			<div id="header-booking-widget-root" className="#fixed #inset-x-0 z-[91]" />
			{isPanelOpen && portalRoot
				? createPortal(
						<div id="header-booking-widget-panel" className={panelClassName}>
							<div className="w-full h-auto max-w-[2560px]">
								{BookingWidgetHero ? (
									<BookingWidgetHero renderMode="surface" />
								) : null}
							</div>
						</div>,
						portalRoot,
					)
				: null}
		</>
	);
}
