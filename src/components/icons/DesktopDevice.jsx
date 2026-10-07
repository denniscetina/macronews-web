export default function DesktopDevice({
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
			<rect className={className} width="20" height="14" x="2" y="3" rx="2" />
			<line className={className} x1="8" x2="16" y1="21" y2="21" />
			<line className={className} x1="12" x2="12" y1="17" y2="21" />
		</svg>
	);
}
