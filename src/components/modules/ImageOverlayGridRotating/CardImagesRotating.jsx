import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { useState } from "react";
import CardDetail from "./CardDetail";
// components
import CardImage from "./CardImage";

const propTypes = {
	cardCount: PropTypes.number,
	card: PropTypes.array,
	labels: PropTypes.object,
};

const CardEffect = ({ children }) => {
	return (
		<motion.div
			className="relative overflow-hidden"
			transition={{ duration: 0.3 }}
			whileHover={{
				scale: 1.01,
			}}
		>
			{children}
		</motion.div>
	);
};

const CardImagesRotating = ({ cardCount, card, labels }) => {
	const [flipped, setFlipped] = useState(false);

	const handleFlipped = () => {
		setFlipped(!flipped);
	};

	return (
		<motion.div
			className={`relative w-full h-full perspective `}
			animate={{ rotateY: flipped ? 180 : 0 }}
			transition={{ duration: 0.6, ease: "easeInOut" }}
			style={{ transformStyle: "preserve-3d" }}
			whileHover={{
				boxShadow:
					"rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px",
			}}
		>
			<div className="w-full h-full inset-0 backface-hidden">
				<div className="w-full relative overflow-hidden">
					<CardEffect>
						<CardImage
							card={card}
							cardCount={cardCount}
							handleFlipped={handleFlipped}
						/>
					</CardEffect>
				</div>
			</div>

			<div
				className="w-full h-full absolute inset-0 backface-hidden"
				style={{ transform: "rotateY(180deg)" }}
			>
				<div className="w-full relative overflow-hidden">
					<CardEffect>
						<CardDetail card={card} handleFlipped={handleFlipped} labels={labels} />
					</CardEffect>
				</div>
			</div>
		</motion.div>
	);
};

CardImagesRotating.propTypes = propTypes;

export default CardImagesRotating;
