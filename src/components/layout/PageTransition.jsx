"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const animations = {
	initial: { opacity: 0 },
	animate: { opacity: 1, transition: { delay: 0.5 } },
	exit: { opacity: 0 },
};

const overlayAnimations = {
	initial: { opacity: 1 },
	animate: { opacity: 0 },
	exit: { opacity: 0 },
};

const TransitionOverlay = ({ pathname }) => {
	const searchParams = useSearchParams();
	const queryString = searchParams?.toString() ?? "";
	const shouldRenderOverlay = !queryString.includes("hash");

	if (!shouldRenderOverlay) {
		return null;
	}

	return (
		<motion.div
			key={`overlay-${pathname}-${queryString}`}
			variants={overlayAnimations}
			initial="initial"
			animate="animate"
			exit="exit"
			className="pointer-events-none fixed inset-0 z-40 bg-[linear-gradient(347deg,rgba(231,231,231,1)_0%,rgba(255,255,255,1)_30%,rgba(255,255,255,1)_70%,rgba(231,231,231,1)_100%)]"
			transition={{ duration: 0.5 }}
		/>
	);
};

const PageTransition = ({ children }) => {
	const pathname = usePathname();

	return (
		<>
			<AnimatePresence mode="wait">
				<Suspense fallback={null}>
					<TransitionOverlay pathname={pathname} />
				</Suspense>
			</AnimatePresence>

			<AnimatePresence mode="wait">
				<motion.div
					key={`page-${pathname}`}
					variants={animations}
					initial="initial"
					animate="animate"
					exit="exit"
					className="z-[1]"
					transition={{ duration: 0.5 }}
				>
					{children}
				</motion.div>
			</AnimatePresence>
		</>
	);
};

export default PageTransition;
