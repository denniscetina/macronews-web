"use client"
import { motion } from "framer-motion";

export default function FadeContent({ children }) {

	return (
		<motion.div
			className="w-full h-auto xl:container lg:mx-auto"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1 }}
		>
			{children}
		</motion.div>
	);
}
