"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import DecorativePalmPicture from "@/components/utils/DecorativePalmPicture";

const positionClasses = {
	leftTop: "top-0 left-0 translate-y-[-15%] lg:translate-y-0",
	leftBottom: "bottom-0 left-0",
	rightTop: "top-0 lg:top-0 right-0 lg:right-0",
	rightBottom:
		"bottom-0 lg:bottom-0 right-0 translate-y-[10%] md:translate-y-[50%] lg:translate-y-0",
};

function getElementKey(element) {
	return element?.elementStyle;
}

function getElementPosition(element) {
	return element?.position;
}

function getElementOffsetX(element) {
	return element?.offsetX ?? 0;
}

function getElementOffsetY(element) {
	return element?.offsetY ?? 0;
}

export default function CardTextInfoParallax({ elements = [] }) {
	const { scrollYProgress } = useScroll({
		layoutEffect: false,
	});
	const y = useTransform(scrollYProgress, [0, 1], [20, -20]);
	const y2 = useTransform(scrollYProgress, [0, 1], [-30, 30]);
	const yValues = [y, y2];

	if (!Array.isArray(elements) || elements.length === 0) {
		return null;
	}

	return (
		<div className="absolute inset-0 pointer-events-none">
			{elements.map((element, i) => (
				<div
					key={`leaf-${i}`}
					className={`absolute ${positionClasses[getElementPosition(element)] || ""} z-1`}
				>
					<motion.div style={{ y: yValues[i % yValues.length] }}>
						<DecorativePalmPicture
							elementStyle={getElementKey(element)}
							style={{
								transform: `translate(${getElementOffsetX(element)}%, ${getElementOffsetY(element)}%)`,
							}}
						/>
					</motion.div>
				</div>
			))}
		</div>
	);
}
