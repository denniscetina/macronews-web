"use client";

import clsx from "clsx";
import { useState } from "react";

function CloseButton({ position = "top-right", onClick }) {
	return (
		<div
			className={`my-[8px] mx-[16px] p-2 flex ${position === "top-right" ? "justify-end" : "justify-start"}`}
		>
			<button
				type="button"
				onClick={onClick}
				className="rounded bg-transparent p-2 transition-colors duration-300 hover:bg-primary cursor-pointer hover:[&_svg_path]:stroke-white"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="25"
					height="25"
					viewBox="0 0 25 25"
					fill="none"
				>
					<title>Close</title>
					<path
						d="M18.959 6.79785L6.95898 18.7979"
						stroke="#253746"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M6.95898 6.79785L18.959 18.7979"
						stroke="#253746"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		</div>
	);
}

export default function RoomCardInteractive({
	directionImg,
	hasDetailData,
	positionBtnClose,
	image,
	details,
	content,
	actions,
	viewDetailsLabel,
	hideDetailsLabel,
	children,
}) {
	const [isDetailsVisible, setIsDetailsVisible] = useState(false);

	return (
		<div
			className={clsx(
				"flex flex-col justify-start lg:justify-center items-start lg:items-center bg-alt min-h-[500px] w-full",
				directionImg,
			)}
		>
			<div className="w-full h-full flex justify-center items-center">
				{hasDetailData ? (
					<>
						<div
							className="hidden lg:block relative h-full w-full min-h-[375px] lg:max-h-full lg:min-w-[530px] xl:min-w-[730px] lg:h-[560px] perspective-[1000px]"
							style={{ perspective: "1000px" }}
						>
							<div
								className="relative h-full w-full transition-transform duration-500 ease-in-out"
								style={{
									transformStyle: "preserve-3d",
									transform: isDetailsVisible ? "rotateY(180deg)" : "rotateY(0deg)",
								}}
							>
								<div className="absolute inset-0 backface-hidden">
									{image}
								</div>
								<div
									className="absolute inset-0 backface-hidden flex flex-col gap-[16px] bg-accent"
									style={{ transform: "rotateY(180deg)" }}
								>
									<CloseButton
										position={positionBtnClose}
										onClick={() => setIsDetailsVisible(false)}
									/>
									<div className="h-full w-full overflow-auto py-[12px] px-[32px] lg:pt-[16px] lg:pb-[58px] lg:px-[64px]">
										{details}
									</div>
								</div>
							</div>
						</div>
						<div className="block lg:hidden w-full h-full">
							{image}
						</div>
					</>
				) : (
					image
				)}
			</div>
			<div className="px-8 py-8 lg:px-16 w-auto text-left flex flex-col gap-8">
				{content}
				<div className="flex flex-row gap-1 md:gap-4">
					{actions}
					{hasDetailData && (
						<button
							className="flex justify-start items-center cursor-pointer gap-1 md:gap-2 font-futura font-[700] text-[18px] leading-[23.4px] tracking-[0.3px] group"
							onClick={() => setIsDetailsVisible((prev) => !prev)}
							type="button"
						>
							<span className="leading-[16px] text-[18px] font-[400] tracking-[0.3px] group-hover:text-primary transition-colors duration-300">
								<span className="hidden lg:inline">{viewDetailsLabel}</span>
								<span className="lg:hidden">
									{isDetailsVisible ? hideDetailsLabel : viewDetailsLabel}
								</span>
							</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="23"
								height="25"
								viewBox="0 0 23 25"
								fill="none"
								className="group-hover:translate-x-2 transition-transform duration-300"
								aria-label="Chevron icon"
								role="img"
							>
								<title>Chevron icon</title>
								<path
									d="M9.43981 16.5068L13.2422 12.2974L9.43981 8.08789"
									stroke="#253746"
									strokeWidth="1.25"
									strokeLinejoin="round"
									className="group-hover:stroke-primary transition-colors duration-300"
								/>
							</svg>
						</button>
					)}
				</div>
				{hasDetailData && (
					<div
						className={clsx(
							"lg:hidden w-full mt-4 transition-all duration-300",
							isDetailsVisible ? "block" : "hidden",
						)}
					>
						{details}
					</div>
				)}
				{children}
			</div>
		</div>
	);
}
