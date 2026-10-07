export default function TabletDevice({
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
			<rect className={className} width="10" height="14" x="3" y="8" rx="2" />
			<path className={className} d="M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4" />
			<path className={className} d="M8 18h.01" />
		</svg>
	);
}
