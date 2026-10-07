import Link from "next/link";
import lodashUnescape from "lodash/unescape";

function ChevronIcon() {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="23"
			height="25"
			viewBox="0 0 23 25"
			fill="none"
			className="transition-transform duration-300 group-hover:translate-x-2"
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
}

export default function OfferDetailsLink({
	href,
	label = "Details",
	className = "",
}) {
	return (
		<Link
			prefetch={false}
			href={href || "#"}
			target="_self"
			className={`${className} group hover:text-primary transition-colors duration-300 inline-flex items-center justify-center gap-2 pb-1 pr-2 text-lg`}
		>
			{lodashUnescape(label)}
			<ChevronIcon />
		</Link>
	);
}
