"use client";
import { motion } from "framer-motion";
import lodashUnescape from "lodash/unescape";
import PropTypes from "prop-types";
import Link from "next/link";

/**
 * custom button component
 *
 * @param {Object} props - component props
 * @param {string} props.styleType - button variant: "solid" | "outlined"
 * @param {boolean} props.useMotion - if true, use framer-motion for hover effects
 * @param {string} props.className - customs css classes
 * @param {Object} props.config - button configuration { url, title, target }
 * @param {boolean} props.showIcon - Show chevron icon
 * @param {string} props.iconPosition - Position of the icon: "left" | "right"
 * @param {string} props.accentCustomColor - Custom background color to button
 *
 */

const ChevronIcon = ({ direction = "right" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="23"
		height="25"
		viewBox="0 0 23 25"
		fill="none"
		className={`transition-transform duration-300 ${
			direction === "left"
				? "group-hover:-translate-x-2 rotate-180"
				: "group-hover:translate-x-2"
		}`}
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
);

const CustomButton = ({
	config,
	className = "",
	showIcon = true,
	iconPosition = "right",
	styleType = "solid",
	useMotion = false,
	accentCustomColor = undefined,
}) => {
	const hasConfig = config && Object.keys(config).length > 0;

	const hoverClasses =
		"group hover:text-primary transition-colors duration-300";

	const secondary = "var(--color-secondary)";
	const accent = accentCustomColor ?? "var(--color-accent)";

	const isSolid = styleType === "solid";
	const initialText = isSolid ? accent : secondary;
	const hoverText = isSolid ? secondary : accent;
	const hoverFill = isSolid ? accent : secondary;
	const borderColor = secondary;

	const fillVariants = {
		rest: { scaleY: 0 },
		hover: { scaleY: 1, transition: { duration: 0.35, ease: "easeInOut" } },
	};

	const textVariants = {
		rest: { color: initialText },
		hover: { color: hoverText, transition: { duration: 0.25 } },
	};

	if (useMotion) {
		return (
			<Link
				prefetch={false}
				href={config.url || "#"}
				target={config.target || undefined}
				rel={config.target ? "noopener noreferrer" : undefined}
			>
				<motion.button
					initial="rest"
					whileHover="hover"
					className={`relative z-2 px-10 py-4 border-2 overflow-hidden inline-flex items-center justify-center cursor-pointer ${className}`}
					style={{
						borderColor,
						backgroundColor: hoverText,
						color: secondary,
					}}
				>
					<motion.span
						className="absolute inset-0 origin-bottom z-0 pointer-events-none"
						style={{
							transformOrigin: "bottom",
							background: hoverFill,
							willChange: "transform",
						}}
						variants={fillVariants}
					/>

					<motion.span
						className="relative z-3 font-medium"
						variants={textVariants}
					>
						{lodashUnescape(config.title)}
					</motion.span>
				</motion.button>
			</Link>
		);
	}

	if (!hasConfig) {
		return (
			<button
				type="button"
				className={`${className} ${showIcon ? hoverClasses : ""} inline-flex items-center justify-center gap-2 pb-1 pr-2`}
			>
				{showIcon && iconPosition === "left" && (
					<ChevronIcon direction="left" />
				)}
				{config?.buttonText || ""}
				{showIcon && iconPosition === "right" && <ChevronIcon />}
			</button>
		);
	}

	return (
		<Link
			prefetch={false}
			href={config.url || "#"}
			target={config.target || undefined}
			rel={config.target ? "noopener noreferrer" : undefined}
			className={`${className} ${showIcon ? hoverClasses : ""} inline-flex items-center justify-center gap-2 pb-1 pr-2`}
		>
			{showIcon && iconPosition === "left" && <ChevronIcon direction="left" />}
			{lodashUnescape(config.title)}
			{showIcon && iconPosition === "right" && <ChevronIcon />}
		</Link>
	);
};

export default CustomButton;

CustomButton.propTypes = {
	config: PropTypes.object,
	className: PropTypes.string,
	showIcon: PropTypes.bool,
	iconPosition: PropTypes.oneOf(["left", "right"]),
	styleType: PropTypes.oneOf(["solid", "outlined"]),
	useMotion: PropTypes.bool,
	accentCustomColor: PropTypes.string,
};
