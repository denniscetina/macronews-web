"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function CardTextInfoFade({ children, className = "" }) {
	const ref = useRef(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "start center"],
		layoutEffect: false,
	});
	const opacity = useTransform(scrollYProgress, [0, 1], [0.45, 1]);

	return (
		<motion.div
			ref={ref}
			style={{ opacity }}
			className={`flex flex-col items-center text-center ${className}`}
		>
			{children}
		</motion.div>
	);
}
