// helpers
import lodashUnescape from "lodash/unescape";
import PropTypes from "prop-types";
import Link from "next/link";
import clsx from "clsx";
// utils
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";
import CustomButton from "@/components/utils/ButtonAnimated/BtnAnimated";

DescriptionCard.propTypes = {
	data: PropTypes.object,
};
export default function DescriptionCard({ data }) {
	const {
		titleDescriptionCard,
		descriptionCard,
		showButtonDescriptionCard,
		buttonDescriptionCard,
		showButton,
		buttonConfig
	} = data;
	const safeHtml = sanitizeHtml(descriptionCard);

	//const hasExtraPadding = titleDescriptionCard || showButtonDescriptionCard;
	const hasExtraPadding = false;

	return (
		<section
            data-component="DescriptionCard"
			className={`relative section-overflow w-full h-auto bg-alt ${hasExtraPadding ? "lg:px-16 py-16 px-8 lg:py-[128px]" : "p-8 px-6 lg:py-16 #lg:py-[128px]"}`}
		>
			<div className="flex flex-col items-center text-center">
				{titleDescriptionCard && (
					<h4 className="font-futura font-normal uppercase text-secondary text-[20px]">
						{titleDescriptionCard}
					</h4>
				)}
				{
					descriptionCard &&
					<div
						className={clsx(
							"prose",
							titleDescriptionCard && "pt-8",
							hasExtraPadding ? "deprecated:py-8" : "deprecated:py-8 deprecated:lg:py-0"
						)}
						dangerouslySetInnerHTML={{ __html: safeHtml }}
					/>
				}
				{false && (
					<Link
						href={buttonDescriptionCard.url}
						target={buttonDescriptionCard.target || undefined}
						rel={
							buttonDescriptionCard.target === "_blank"
								? "noopener noreferrer"
								: undefined
						}
						className="relative z-2 p-[12px] border border-secondary text-secondary overflow-hidden inline-block cursor-pointer uppercase hover:bg-secondary hover:text-alt transition-colors duration-300"
					>
						{lodashUnescape(buttonDescriptionCard.title)}
					</Link>
				)}
				{
					showButton && (
						<CustomButton
							button={buttonConfig.linkButton}
							styleButton={buttonConfig.styleButton}
						/>
					)
				}
			</div>
		</section>
	);
}
