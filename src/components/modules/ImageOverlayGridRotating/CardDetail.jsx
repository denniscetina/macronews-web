// helpers
import map from "lodash/map";
import PropTypes from "prop-types";
import { useEffect } from "react";
import img360 from "@/assets/img/360Icon.png";
import BtnAnimated from "@/components/utils/ButtonAnimated/BtnAnimated";
// utils
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";
import clsx from "clsx";

const propTypes = {
	card: PropTypes.array,
	handleFlipped: PropTypes.func,
	labels: PropTypes.object,
};

const CardDetail = ({ card, handleFlipped, labels = {} }) => {
	const { close = "Close" } = labels;
	const {
		cardDetailLogo,
		cardDetailTitle,
		footerButtons,
		renderButton360,
		link360,
		cardDetaildescription,
	} = card.detailInformation;
	const safeHtml = sanitizeHtml(cardDetaildescription);

	useEffect(() => {
		let observer;

		const addLenisPrevent = () => {
			const menuLists = document.querySelectorAll(
				".container-description-card-image-overlay-grid-rotating",
			);
			menuLists.forEach((menuList) => {
				if (menuList && !menuList.hasAttribute("data-lenis-prevent")) {
					menuList.setAttribute("data-lenis-prevent", "true");
				}
			});
		};

		observer = new MutationObserver(() => {
			addLenisPrevent();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		addLenisPrevent();

		return () => {
			if (observer) observer.disconnect();
		};
	}, []);

	return (
		<div className="flex justify-center bg-accent">
			<div className="flex w-full flex-col items-start max-h-[454px] h-[454px] md:max-h-[670px] lg:max-h-[670px] lg:h-[670px]">
				<div className="w-full h-full">
					<div className="flex w-full justify-end top-right -mx-2 mt-2 shrink-0">
						<button
							type="button"
							className="cursor-pointer btnclose"
							onClick={handleFlipped}
							aria-label={close}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="25"
								height="25"
								viewBox="0 0 25 25"
								fill="none"
							>
								<title>{close}</title>
								<path
									d="M18.959 6.79785L6.95898 18.7979"
									stroke="#253746"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<path
									d="M6.95898 6.79785L18.959 18.7979"
									stroke="#253746"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					</div>
					<div className="w-full h-full flex flex-col overflow-hidden items-start px-8">
						<div className="shrink-0">
							<img
								className="h-[60px] max-h-[60px]"
								src={cardDetailLogo.url}
								alt="detailLogo"
							/>
						</div>
						<div className="w-[100%] md:w-[70%] border-b border-menuBar mt-4 shrink-0" />
						<h3 className="text-secondary pt-4 body-medium capitalize tracking-[2.4px] shrink-0">
							{cardDetailTitle}
						</h3>
						<div
							className={clsx(
								"prose container-description-card-image-overlay-grid-rotating",
								"[&_p]:text-blue-200 [&_p]:text-form",
								"mt-6 flex-[0.75] lg:flex-[0.85] overflow-y-auto pr-2"
							)}
							dangerouslySetInnerHTML={{ __html: safeHtml }}
						/>
						<div className="flex flex-wrap-reverse lg:flex-nowrap w-full justify-start gap-2 pt-2 lg:pt-4 shrink-0">
							<div className="flex gap-4">
								{footerButtons?.length > 0 &&
									map(footerButtons, (btn, i) => {
										const {
											typeOfAction,
											textForButton,
											uploadedFile,
											redirectSettings,
										} = btn;
										const { redirectType, externalURL, internalPageLink } =
											redirectSettings;

										if (!typeOfAction && uploadedFile?.url) {
											return (
												<div key={i}>
													<BtnAnimated
														className="w-[80px] lg:w-full h-[36px]"
														textStyle="text-[11px]"
														isExternalLink
														styleButton="outlined"
														button={{
															title: textForButton,
															url: uploadedFile.url,
														}}
													/>
												</div>
											);
										}

										// 👉 Internal redirect
										if (typeOfAction && !redirectType) {
											return (
												<div key={i}>
													<BtnAnimated
														className="w-[80px] lg:w-full h-[36px]"
														textStyle="text-[11px]"
														styleButton="outlined"
														button={{
															title: textForButton,
															url: internalPageLink.url,
														}}
													/>
												</div>
											);
										}

										// 👉 External redirect
										if (typeOfAction && redirectType) {
											return (
												<div key={i}>
													<BtnAnimated
														className="w-[80px] lg:w-full h-[36px]"
														textStyle="text-[11px]"
														isExternalLink
														styleButton="outlined"
														button={{
															title: textForButton,
															url: externalURL,
														}}
													/>
												</div>
											);
										}

										return null;
									})}
							</div>
							{renderButton360 && (
								<a
									href={link360}
									target="_blank"
									rel="noopener noreferrer"
									className="flex lg:items-center bg-contain w-[20%] h-auto lg:pl-2 cursor-pointer"
								>
									<img
										className="w-full h-auto object-contain"
										alt="Img 360"
										src={img360}
									/>
								</a>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

CardDetail.propTypes = propTypes;

export default CardDetail;
