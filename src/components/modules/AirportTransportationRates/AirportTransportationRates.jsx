import PropTypes from "prop-types";
// utils
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";

AirportTransportationRates.propTypes = {
	data: PropTypes.object,
};
export default function AirportTransportationRates({ data }) {
	const { serviceRateComponent } = data;
	const menuBar = "var(--color-menuBar)";

	return (
		<section data-component="AirportTransportationRates" className="relative section-overflow w-full h-auto p-8 bg-base1">
			{serviceRateComponent.map((rate, i) => {
				const { titleOfTheService, descriptionOfTheService, cardOfTheRate } =
					rate;
				const safeHtml = sanitizeHtml(descriptionOfTheService);
				return (
					<div className="flex flex-col items-center text-center" key={i}>
						<div className="lg:w-[40%]">
							<h4 className="text-secondary font-glosa font-medium text-2xl md:text-2xl lg:text-2xl leading-tight capitalize py-8">
								{titleOfTheService}
							</h4>
							<div style={{ border: `1px solid ${menuBar}`, padding: "1rem" }}>
								{cardOfTheRate.length > 0 &&
									cardOfTheRate.map((card, index) => {
										const { pricingCardTitle, serviceRates } = card;
										return (
											<div
												className="mb-4 font-futura capitalize text-secondary text-[16px]"
												key={index}
											>
												<h4 className="p-4 uppercase">{pricingCardTitle}</h4>
												{serviceRates.length > 0 &&
													serviceRates.map((service, idx) => {
														const { serviceRateName, serviceRatePrice } =
															service;
														return (
															<div
																className="flex flex-row justify-between mt-4"
																key={idx}
															>
																<div className="w-[50%] lg:w-[60%]">
																	{serviceRateName}
																</div>
																<div className="w-[40%]">
																	{serviceRatePrice}
																</div>
															</div>
														);
													})}
											</div>
										);
									})}
							</div>
							<div
								className="wysiwyg py-8"
								dangerouslySetInnerHTML={{ __html: safeHtml }}
							/>
						</div>
					</div>
				);
			})}
		</section>
	);
}
