import PropTypes from "prop-types";

export default function DotsLoader({ isSurfaceMode }) {
	const dotColor = isSurfaceMode ? "#253746" : "#FFFFFF";

	return (
		<div className="flex items-center gap-1">
			<span
				className="w-1.5 h-1.5 rounded-full animate-bounce"
				style={{ backgroundColor: dotColor, animationDelay: "0ms" }}
			/>
			<span
				className="w-1.5 h-1.5 rounded-full animate-bounce"
				style={{ backgroundColor: dotColor, animationDelay: "150ms" }}
			/>
			<span
				className="w-1.5 h-1.5 rounded-full animate-bounce"
				style={{ backgroundColor: dotColor, animationDelay: "300ms" }}
			/>
		</div>
	);
}

DotsLoader.propTypes = {
	isSurfaceMode: PropTypes.bool.isRequired,
};
