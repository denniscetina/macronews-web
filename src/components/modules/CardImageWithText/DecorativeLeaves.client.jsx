"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import DecorativePalmPicture from "@/components/utils/DecorativePalmPicture";

const positionClasses = {
	leftTop: clsx(
		"top-0 left-0 bottom-0 right-0 transform md:translate-y-[-15%] translate-y-[-10%] rotate-y-[3.142rad]",
		"lg:translate-x-0 lg:translate-y-0 lg:rotate-y-0"
	),
	leftBottom: clsx(
		"bottom-0 left-0 right-0 md:translate-y-[15%] translate-y-[10%] rotate-y-[3.142rad]",
		"lg:translate-x-0 lg:translate-y-0 lg:rotate-y-0"
	),
	rightTop: clsx(
		"top-0 right-0 bottom-0 -translate-y-[-87%] md:-translate-y-[-80%]",
		"lg:-translate-y-0"
	),
	rightBottom: "right-0 bottom-0",
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

export default function DecorativeLeaves({ elements = [] }) {
	const [canRender, setCanRender] = useState(false);

	useEffect(() => {
		if (!Array.isArray(elements) || elements.length === 0) return undefined;

		if ("requestIdleCallback" in window) {
			const idleId = window.requestIdleCallback(() => setCanRender(true));
			return () => window.cancelIdleCallback(idleId);
		}

		const timeoutId = window.setTimeout(() => setCanRender(true), 1);
		return () => window.clearTimeout(timeoutId);
	}, [elements]);

	if (!canRender || !Array.isArray(elements) || elements.length === 0) {
		return null;
	}

	return elements.map((element, index) => {
		const elementStyle = getElementKey(element);
		if (!elementStyle) return null;

		return (
			<div
				key={`palms_${index}`}
				className={clsx(
					"absolute z-1 pointer-events-none",
					positionClasses[getElementPosition(element)],
					elements.length === 1 && "hidden lg:block"
				)}
			>
				<DecorativePalmPicture
					elementStyle={elementStyle}
					style={{
						transform: `translate(${getElementOffsetX(element)}%, ${
							getElementOffsetY(element)
						}%)`,
						opacity: 0.75,
					}}
				/>
			</div>
		);
	});
}
