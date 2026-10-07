export default function MobileDevice({
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
			<rect className={className} width="14" height="20" x="5" y="2" rx="2" ry="2" />
			<path className={className} d="M12 18h.01" />
		</svg>
	);
}
