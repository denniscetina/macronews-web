"use client";
import { motion } from "framer-motion";
// helpers
import lodashUnescape from "lodash/unescape";
import PropTypes from "prop-types";
import Link from "next/link";

export default function BtnAnimated(props) {
	const {
		button,
		styleButton = "solid",
		isbuttonLink = true,
		className,
		dataAtributes = {},
		IsLoading = false,
		IsDisabled = false,
		textStyle = "",
		isExternalLink = false,
	} = props;
	const secondary = "var(--color-secondary)";
	const accent = "var(--color-accent)";
	const primary = "var(--color-primary)";
	const normalizedStyleButton = styleButton === "outlined" ? "outline" : styleButton;

	const isInline = normalizedStyleButton === "inline";
	const isSolid = normalizedStyleButton === "solid";
	const initialText = isSolid ? accent : secondary;
	const hoverText = isInline ? primary : isSolid ? secondary : accent;
	const hoverFill = isSolid ? accent : secondary;
	const borderColor = secondary;

	const buttonVariants = isInline
		? {
			rest: { borderColor },
			hover: { borderColor: primary, transition: { duration: 0.25 } },
		}
		: undefined;

	const fillVariants = {
		rest: { scaleY: 0 },
		hover: { scaleY: 1, transition: { duration: 0.35, ease: "easeInOut" } },
	};

	const textVariants = {
		rest: { color: initialText },
		hover: { color: hoverText, transition: { duration: 0.25 } },
	};

	const buttonClasses = [
		className,
		isInline
			? "relative z-2 pb-2 pr-[2px] border-b overflow-hidden inline-flex items-center gap-3 group transition-colors duration-300"
			: "relative z-2 px-8 lg:px-10 py-4 border-2 overflow-hidden flex items-center justify-center group transition-colors duration-500",
		IsDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
		button.className,
	]
		.filter(Boolean)
		.join(" ");

	const motionbtn = (
		<motion.button
			initial="rest"
			whileHover={IsDisabled ? undefined : "hover"}
			variants={buttonVariants}
			className={buttonClasses}
			style={{ borderColor, backgroundColor: isInline ? "transparent" : hoverText }}
			onClick={() => {
				if (IsDisabled || IsLoading) return;
				if (button.onClick) button.onClick();
			}}
			type="button"
			disabled={IsDisabled}
			{...dataAtributes}
		>
			{IsLoading && (
				<span
					className="inline-block w-4 h-4 border-2 mr-2 rounded-full animate-spin"
					style={{ borderColor: initialText, borderTopColor: "transparent" }}
				/>
			)}
			{!isInline ? (
				<motion.span
					className="absolute inset-0 origin-bottom z-0 pointer-events-none"
					style={{
						transformOrigin: "bottom",
						background: hoverFill,
						willChange: "transform",
					}}
					variants={fillVariants}
				/>
			) : null}

			<motion.span
				className={`relative z-3 font-medium ${textStyle}`}
				variants={textVariants}
			>
				{typeof button.title === "string"
					? lodashUnescape(button.title)
					: button.title}
			</motion.span>
			{isInline ? (
				<motion.span
					className="relative z-3 text-base leading-none"
					variants={{
						rest: { x: 0, color: initialText },
						hover: { x: 4, color: hoverText, transition: { duration: 0.2 } },
					}}
					aria-hidden="true"
				>
					&gt;
				</motion.span>
			) : null}
		</motion.button>
	);
	if (!isbuttonLink) {
		return motionbtn;
	}

	if (isExternalLink) {
		return (
			<a
				className={className}
				href={button?.url || "#"}
				target="_blank"
				rel="noopener noreferrer"
				{...dataAtributes}
				onClick={(e) => {
					if (IsDisabled || IsLoading) {
						e.preventDefault();
					}
				}}
			>
				{motionbtn}
			</a>
		);
	}

	return (
		<Link
			className={className}
			href={button?.url || "#"}
			target={button.target}
			rel={button.target === "_blank" ? "noopener noreferrer" : undefined}
			{...dataAtributes}
			onClick={(e) => {
				if (IsDisabled || IsLoading) {
					e.preventDefault();
				}
			}}
		>
			{motionbtn}
		</Link>
	);
}

BtnAnimated.propTypes = {
	button: PropTypes.shape({
		url: PropTypes.string.isRequired,
		title: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
			.isRequired,
		target: PropTypes.string,
		onClick: PropTypes.func,
		className: PropTypes.string,
	}).isRequired,
	IsDisabled: PropTypes.bool,
	IsLoading: PropTypes.bool,
	dataAtributes: PropTypes.object,
	isbuttonLink: PropTypes.bool,
	styleButton: PropTypes.oneOf(["solid", "outline", "outlined", "inline"]),
	isExternalLink: PropTypes.bool,
};
