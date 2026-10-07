"use client";

import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";
import { useEffect, useRef, useState } from "react";
import intro from "@/assets/lottie/intro.json";

const INTRO_PLAYBACK_SPEED = 2.5;

export default function SiteIntroAnimation({ onComplete }) {
	const [isVisible, setIsVisible] = useState(true);
	const lottieRef = useRef(null);

	useEffect(() => {
		lottieRef.current?.setSpeed(INTRO_PLAYBACK_SPEED);
	}, []);

	return (
		<AnimatePresence onExitComplete={onComplete}>
			{isVisible && (
				<motion.div
					key="intro"
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					exit={{ opacity: 0 }}
					className="w-screen h-screen transition-opacity overflow-hidden absolute inset-0 z-[100] flex items-center justify-center bg-[linear-gradient(347deg,_rgba(231,231,231,1)_0%,_rgba(255,255,255,1)_30%,_rgba(255,255,255,1)_70%,_rgba(231,231,231,1)_100%)]"
				>
					<motion.div
						key="intro-content"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="max-w-96"
					>
						<Lottie
							lottieRef={lottieRef}
							animationData={intro}
							loop={false}
							onDOMLoaded={() => {
								lottieRef.current?.setSpeed(INTRO_PLAYBACK_SPEED);
							}}
							onComplete={() => setIsVisible(false)}
						/>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
