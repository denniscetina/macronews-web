import ChevronDownIcon from "@/components/icons/ChevronDown";

function getTermTitle(item) {
	return item?.titleTermsAndConditions || item?.label || "";
}

function getTermDescription(item) {
	return item?.descriptionTermsAndConditions || item?.description || "";
}

export default function TermsAndConditions({ data }) {
	const {
		termsAndConditions = [],
		cardTitleTermsAndConditions,
		logoTermsAndConditions,
		accordionMode,
		backgroundColor = "accent",
	} = data;
	const termsList = Array.isArray(termsAndConditions) ? termsAndConditions : [];
	const accordionGroupName = accordionMode ? undefined : "terms-and-conditions";

	return (
		<section
			data-component="TermsAndConditions"
			className={`relative overflow-hidden bg-${backgroundColor} w-full h-auto flex flex-col items-center p-8 px-6 lg:py-16 min-h-[252px]`}
		>
			<div className="w-full max-w-7xl $px-6 $pb-8">
				{(logoTermsAndConditions || cardTitleTermsAndConditions) && (
					<div className="flex flex-col items-center text-center pt-8">
						{logoTermsAndConditions && (
							<img
								src={logoTermsAndConditions.url}
								alt={logoTermsAndConditions.alt || "logo"}
								className="relative lg:w-10 lg:h-10 w-8 h-8 mb-2"
							/>
						)}

						{cardTitleTermsAndConditions && (
							<h4 className="font-futura text-2xl md:text-2xl lg:text-2xl leading-[32px] text-[20px] text-secondary uppercase">
								{cardTitleTermsAndConditions}
							</h4>
						)}
					</div>
				)}
				{termsList.length > 0 &&
					termsList.map((item, index) => {
						const termTitle = getTermTitle(item);
						const termDescription = getTermDescription(item);

						return (
							<details
								id={`item-${index}`}
								key={`terms-and-conditions-${index}`}
								name={accordionGroupName}
								className="group/details pt-8"
							>
								<summary
									className="flex justify-between w-full pb-3 mb-3 border-b-[1.5px] border-secondary cursor-pointer list-none [&::-webkit-details-marker]:hidden"
								>
									<h4 className="font-futura font-[450] leading-[16px] text-[20px] text-secondary uppercase">
										{termTitle}
									</h4>
									<span
										className="transition-transform duration-300 ease-in-out group-open/details:rotate-180"
									>
										<ChevronDownIcon className="text-secondary h-5 w-5 object-contain" />
									</span>
								</summary>
								<div className="overflow-hidden">
									<div
										className="prose [&_p]:text-base [&_p]:text-secondary [&_p]:mt-5 #container-description-terms-and-conditions"
										dangerouslySetInnerHTML={{
											__html: termDescription,
										}}
									/>
								</div>
							</details>
						);
					})}
			</div>
		</section>
	);
}
