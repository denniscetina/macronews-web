// helpers
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
// prop-types
import PropTypes from "prop-types";
// utils
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";
import clsx from "clsx";
import { createTranslator } from "@/lib/i18n/translator";

DiningDescriptionCard.propTypes = {
	data: PropTypes.object,
	dict: PropTypes.object,
};

export default function DiningDescriptionCard({ data, dict = {} }) {
	const t = createTranslator(dict);
	const hoursLabel = t("DiningDescriptionCard.lbl_hours", "HOURS");

	const image = get(data, "image", undefined);
	const logo = get(data, "logo", undefined);
	const title = get(data, "title", "");
	const description = get(data, "description", "");
	const schedules = get(data, "schedules", []);
	const imagePosition = get(data, "imagePosition", "right");
	const showMoreDetails = get(data, "showMoreDetails", false);
	const additionalInformationTitle = get(data, "additionalInformationTitle", hoursLabel);
	const additionalInformation = get(data, "additionalInformation", "");
	const recipeAndPreparation = get(data, "recipeAndPreparation", "");
	const description_ = sanitizeHtml(description);
	const containerClasses = `relative w-full overflow-y-hidden flex flex-col pt-8 px-4 md:px-6 items-center justify-center bg-white`;
	const innerContainerClasses = `flex flex-col lg:flex-row max-w-[1485px] w-full`;

	const textOrderClass = imagePosition === "left" ? "lg:order-2" : "lg:order-1";
	const imageOrderClass =
		imagePosition === "left" ? "lg:order-1" : "lg:order-2";

	return (
		<section
			data-component="DiningDescriptionCard"
			className={containerClasses}
		>
			<div className={innerContainerClasses}>
				<div
					className={`flex flex-col bg-alt px-4 py-16 md:px-12 lg:px-20 justify-center items-center lg:items-start gap-6 lg:gap-8 w-full lg:w-1/2 ${textOrderClass}`}
				>
					<div className="flex flex-col max-w-[563px] items-center lg:items-start gap-4 lg:gap-6 w-full">
						<div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 w-full">
							{logo?.url && (
								<img src={logo.url} alt={logo.alt || "logo-card-dining"} />
							)}
							<div className="text-secondary text-center lg:text-left font-futura font-normal text-lg md:text-xl leading-[20px] tracking-[2.4px] uppercase">
								{title}
							</div>
						</div>
						<div
							className={clsx(
								"prose #container-description-dining-card text-center lg:text-left",
								"font-futura font-normal",
								"prose-p:leading-[160%] prose-p:[leading-trim:both] prose-p:[text-edge:cap] prose-p:text-[#5C6974]",
								"prose-p:text-sm md:prose-p:text-base"
							)}
							dangerouslySetInnerHTML={{ __html: description_ }}
						/>
					</div>

					{showMoreDetails && (
						<>
							{additionalInformation === "schedules" ? (
								<div className="flex flex-col items-center lg:items-start gap-4 lg:gap-6 w-full">
									{
										additionalInformationTitle && (
											<div className="text-secondary font-futura font-normal text-[16px] leading-4 tracking-[2.4px] uppercase">
												{additionalInformationTitle}
											</div>
										)
									}
									<div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
										{!isEmpty(schedules) &&
											schedules.map((schedule, index) => (
												<div
													key={index}
													className="flex flex-col justify-between items-center lg:items-start gap-1 w-full md:w-auto"
												>
													<div className="text-[#5C6974] font-futura text-lg md:text-[18px] font-[450] leading-[25.6px]">
														{`${schedule.mealTime}:`}
													</div>
													<div className="text-[#5C6974] font-futura text-base md:text-[16px] font-normal leading-[160%] text-center lg:text-left">
														{schedule.timeRange}
													</div>
												</div>
											))}
									</div>
								</div>
							) : additionalInformation === "recipeAndPreparation" ? (
								<div
									className={clsx(
										"prose container-additional-information-dining-card",
										"prose max-w-none w-full columns-1 sm:columns-2 gap-8 text-center lg:text-lef",
										"prose-p:font-futura prose-p:font-normal prose-p:text-secondary prose-p:uppercase prose-p:leading-4 prose-p:tracking-[2.4px] prose-p:mb-6 prose-p:text-base md:prose-p:text-xl prose-p:break-inside-avoid prose-p:[page-break-inside:avoid] prose-p:block",
										"prose-ul:mt-2 prose-ul:mb-6 prose-ul:last:mb-0 prose-ul:break-inside-avoid prose-ul:[page-break-inside:avoid] prose-ul:block",
										"prose-li:list-disc prose-li:text-[#5C6974] prose-li:font-normal prose-li:leading-[160%] prose-li:mb-1 prose-li:break-inside-auto prose-li:-indent-[1.7rem] prose-li:pl-6 prose-li:text-sm md:prose-li:text-base",
										"[&>p+ul]:mt-0"
									)}
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(recipeAndPreparation),
									}}
								/>
							) : null}
						</>
					)}
				</div>

				{image?.url && (
					<div className={`w-full lg:w-1/2 ${imageOrderClass}`}>
						<img
							src={image.url}
							alt={image.alt || "background-card-dining"}
							className="w-full h-auto object-cover lg:max-h-[563px]"
						/>
					</div>
				)}
			</div>
		</section>
	);
}
