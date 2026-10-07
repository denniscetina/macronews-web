"use client";

import clsx from "clsx";
import Link from "next/link";
import PropTypes from "prop-types";
import ArrowLeft from "@/components/icons/ArrowLeft";
import ArrowRight from "@/components/icons/ArrowRight";
import CirclePlus from "@/components/icons/CirclePlus";

const ICON_BY_KEY = {
	"arrow-left": ArrowLeft,
	"arrow-right": ArrowRight,
	plus: CirclePlus,
};

function scrollToSection(selector) {
	if (typeof window === "undefined" || typeof document === "undefined") {
		return;
	}

	const target = document.querySelector(selector);
	if (!target) {
		return;
	}

	const offsetTop = target.getBoundingClientRect().top + window.scrollY - 200;
	window.scrollTo({
		top: Math.max(offsetTop, 0),
		behavior: "smooth",
	});
}

Button.propTypes = {
	link: PropTypes.object,
	isSubmit: PropTypes.bool,
	name: PropTypes.string,
	className: PropTypes.string,
	icon: PropTypes.string,
	type: PropTypes.bool,
	showLabel: PropTypes.bool,
	action: PropTypes.func,
	isDisabled: PropTypes.bool,
};

export default function Button({
	link,
	isSubmit = false,
	name = "",
	className = "",
	icon,
	showLabel = true,
	action,
	type,
	isDisabled = false,
}) {
	const Icon = icon ? ICON_BY_KEY[icon] || CirclePlus : null;
	const hasHashLink =
		!isSubmit &&
		typeof link?.url === "string" &&
		link.url.length > 1 &&
		link.url.startsWith("#");

	const hasLink = !isSubmit && typeof link?.url === "string" && !hasHashLink;
	const hasSolidVariant = className.includes("button-solid");
	const hasLoadVariant = className.includes("button-load");
	const hasLargeVariant = className.includes("button-large");

	const baseClasses =
		"inline-flex items-center gap-4 uppercase text-white transition-all";
	const variantClasses = clsx(
		hasSolidVariant && "bg-primary inline-block w-full py-xs px-sm text-center m-0 lg:w-auto lg:py-xs",
		hasLoadVariant && "rounded-[20px] border-[1.5px] py-xs px-xs",
	);
	const iconClasses = clsx(
		"transition-all h-auto w-auto",
		hasLargeVariant && "h-[26px] w-[26px] lg:h-[34px] lg:w-[34px]",
	);

	const renderContent = (labelHtml) => (
		<>
			{showLabel && <span dangerouslySetInnerHTML={{ __html: labelHtml }} />}
			{Icon && (
				<i aria-hidden="true">
					<Icon className={iconClasses} />
				</i>
			)}
		</>
	);

	if (isSubmit) {
		return (
			<button
				type={type ? "submit" : "button"}
				onClick={action ?? undefined}
				className={clsx(baseClasses, variantClasses, className)}
				disabled={isDisabled}
			>
				{renderContent(name)}
			</button>
		);
	}

	if (hasHashLink) {
		return (
			<button
				type="button"
				className={clsx(baseClasses, variantClasses, className)}
				onClick={() => scrollToSection(link.url)}
				disabled={isDisabled}
			>
				{renderContent(link.title || "")}
			</button>
		);
	}

	if (hasLink) {
		return (
			<Link
				className={clsx(baseClasses, variantClasses, className)}
				href={link.url}
				target={link.target || undefined}
				rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
				aria-disabled={isDisabled ? "true" : undefined}
			>
				{renderContent(link.title || "")}
			</Link>
		);
	}

	return null;
}
