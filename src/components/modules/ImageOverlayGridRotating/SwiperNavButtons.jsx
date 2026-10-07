const SwiperNavButtons = ({ instance, isMobile, custom, buttonStyle }) => {
	const onPrev = () => {
		instance?.current?.swiper?.slidePrev();
	};

	const onNext = () => {
		instance?.current?.swiper?.slideNext();
	};

	return (
		<div
			style={{
				bottom: buttonStyle ? buttonStyle : `${isMobile ? "-40px" : "20%"}`,
			}}
			className="absolute left-0 right-0 transform -translate-y-1/2 flex justify-between px-4 z-10 "
		>
			<button
				type="button"
				onClick={onPrev}
				className="absolute top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-13 md:h-13 bg-[#BA7961] text-white rounded-full flex items-center justify-center cursor-pointer z-10"
				aria-label="Slide anterior"
				style={{ left: `${isMobile ? "30%" : "-18px"}` }}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="10"
					height="19"
					viewBox="0 0 10 19"
					fill="none"
					aria-hidden={true}
				>
					<path
						d="M9.46036 18.4493L0.752319 9.74124L9.46036 1.0332"
						stroke="white"
						strokeWidth="1.5"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
			{!!custom && custom}
			<button
				type="button"
				onClick={onNext}
				className="absolute top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-13 md:h-13 bg-[#BA7961] text-white rounded-full flex items-center justify-center cursor-pointer z-10"
				aria-label="Slide siguiente"
				style={{ right: `${isMobile ? "30%" : "-18px"}` }}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="37"
					height="40"
					viewBox="0 0 37 40"
					fill="none"
					aria-hidden={true}
				>
					<path
						d="M13.9397 29.5432L22.7927 19.7423L13.9397 9.94141"
						stroke="white"
						strokeWidth="1.5"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		</div>
	);
};

export default SwiperNavButtons;
