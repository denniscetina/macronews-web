import PropTypes from "prop-types";

export default function IconBed({ className, color = "inverse", title = "Bed" }) {
	const stroke = color === "surface" ? "#253746" : "#FFFFFF";

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke={stroke}
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			role="img"
			aria-label={title}
			className={className}
		>
			<title>{title}</title>
			<path d="M2 4v16" />
			<path d="M2 8h18a2 2 0 0 1 2 2v10" />
			<path d="M2 17h20" />
			<path d="M6 8v9" />
		</svg>
	);
}

IconBed.propTypes = {
	className: PropTypes.string,
	color: PropTypes.oneOf(["inverse", "surface"]),
	title: PropTypes.string,
};
