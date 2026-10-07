import BtnAnimated from "@/components/utils/ButtonAnimated/BtnAnimated";
import ButtonLink from "@/components/utils/ButtonLink";
import clsx from "clsx";

export default function PopupActions({
	ctas = [],
	className = "",
}) {
	const actionsClassName = clsx(
		"popup-ads-next-actions my-8 md:my-4 w-full md:w-fit gap-2 md:gap-4 flex flex-row justify-around md:justify-end items-end",
		className,
	);
	const safeCtas = Array.isArray(ctas)
		? ctas.filter((item) => {
			const url = typeof item?.url === "string" ? item.url.trim() : "";
			return Boolean(url && url !== "#" && url !== "/#");
		})
		: [];

	const primaryCta =
		safeCtas.find((item) => String(item?.style || "").toLowerCase() === "primary") ||
		null;
	const textLinkCta =
		safeCtas.find((item) => String(item?.style || "").toLowerCase() === "text_link") ||
		null;

	if (!primaryCta && !textLinkCta) {
		return null;
	}

	return (
		<div data-utils="PopupActions" className={actionsClassName}>
			{textLinkCta?.url && (
				<ButtonLink
					config={{
						url: textLinkCta.url,
						title: textLinkCta.label || "View Offer",
						target: textLinkCta.openInNewTab ? "_blank" : undefined,
					}}
					className="border-b w-fit h-fit"
				/>
			)}

			{primaryCta?.url && (
				<BtnAnimated
					styleButton="solid"
					isbuttonLink
					isExternalLink={primaryCta.openInNewTab === true}
					className="block w-fit"
					button={{
						title: primaryCta.label || "Book Now",
						url: primaryCta.url,
						target: primaryCta.openInNewTab ? "_blank" : undefined,
					}}
				/>
			)}
		</div>
	);
}
