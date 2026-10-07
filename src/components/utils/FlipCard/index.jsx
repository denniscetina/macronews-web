import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
	cloneElement,
	forwardRef,
	isValidElement,
	useImperativeHandle,
	useState,
} from "react";

const FlipCard = forwardRef(
	(
		{
			front,
			back,
			className,
			isFlipped,
			onFlip,
			positionBtnClose = "top-right",
			classNamesBack,
			classNamesFront,
		},
		ref,
	) => {
		// si el padre no controla, usamos un estado interno
		const [internalFlipped, setInternalFlipped] = useState(false);
		const flipped = isFlipped !== undefined ? isFlipped : internalFlipped;

		const handleFlip = () => {
			if (onFlip) {
				onFlip(!flipped); // avisa al padre
			} else {
				setInternalFlipped(!flipped); // manejo interno
			}
		};

		// Propagar estado y función al padre mediante ref
		useImperativeHandle(
			ref,
			() => ({
				flipped,
				handleFlip,
			}),
			[flipped],
		);

		// Inyectamos `onFlip` en los children usando React.cloneElement
		const injectOnFlip = (content) => {
			if (!isValidElement(content)) return content;

			if (typeof content.type === "string") {
				return content;
			}

			return cloneElement(content, { onFlip: handleFlip });
		};

		const frontWithProps = injectOnFlip(front);
		const backWithProps = injectOnFlip(back);

		const frontClasses = ["absolute inset-0 backface-hidden", classNamesFront]
			.filter(Boolean)
			.join(" ");

		const backContentClasses = [
			"h-full w-full overflow-auto",
			classNamesBack || "py-[12px] px-[32px] lg:pt-[16px] lg:pb-[58px] lg:px-[64px]",
		]
			.filter(Boolean)
			.join(" ");

		const closeButtonClasses =
			"rounded bg-transparent p-2 transition-colors duration-300 hover:bg-primary cursor-pointer hover:[&_svg_path]:stroke-white";

		return (
			<motion.div
				className={`relative w-full h-full perspective-[1000px] ${className || ""}`}
				animate={{ rotateY: flipped ? 180 : 0 }}
				transition={{ duration: 0.6, ease: "easeInOut" }}
				style={{ transformStyle: "preserve-3d" }}
			>
				{/* FRONT */}
				<div className={frontClasses}>
					{frontWithProps}
				</div>

				{/* BACK */}
				<div
					className="absolute inset-0 backface-hidden flex flex-col gap-[16px] bg-accent"
					style={{ transform: "rotateY(180deg)" }}
				>
					<div
						className={`my-[8px] mx-[16px] p-2 flex ${positionBtnClose === "top-right" ? "justify-end" : "justify-start"}`}
					>
						<button type="button" onClick={handleFlip} className={closeButtonClasses}>
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
					<div className={backContentClasses}>
						{backWithProps}
					</div>
				</div>
			</motion.div>
		);
	},
);

FlipCard.propTypes = {
	front: PropTypes.node.isRequired,
	back: PropTypes.node.isRequired,
	className: PropTypes.string,
	isFlipped: PropTypes.bool, // controlado desde padre
	onFlip: PropTypes.func, // callback
	positionBtnClose: PropTypes.oneOf(["top-left", "top-right"]),
	classNamesBack: PropTypes.string,
	classNamesFront: PropTypes.string,
};

export default FlipCard;
