export default function ArrowRight({
	className = "",
	size = 24,
	color = "currentColor",
	strokeWidth = 2,
	...props
}) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke={color}
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
			{...props}
		>
			<path d="m12 5 7 7-7 7" />
			<path d="M5 12h14" />
		</svg>
	);
}
