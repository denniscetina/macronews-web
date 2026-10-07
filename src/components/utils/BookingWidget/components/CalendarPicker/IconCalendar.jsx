import PropTypes from "prop-types";

function IconCalendar({ title = "Calendar", className, color = "inverse" }) {
	const stroke = color === "surface" ? "#253746" : "#FFFFFF";

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={18}
			height={18}
			viewBox="0 0 24 24"
			fill="none"
			stroke={stroke}
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-label={title}
			role="img"
			className={className}
		>
			<title>{title}</title>
			<path d="M8 2v4" />
			<path d="M16 2v4" />
			<rect width="18" height="18" x="3" y="4" rx="2" />
			<path d="M3 10h18" />
		</svg>
	);
}

IconCalendar.propTypes = {
	title: PropTypes.string,
	className: PropTypes.string,
	color: PropTypes.oneOf(["inverse", "surface"]),
};

export default IconCalendar;
