// prop-types
import PropTypes from "prop-types";
import Image from "next/image";
// assets
import AppStore from "@/assets/img/Appstore-logo.svg";
import GooglePlay from "@/assets/img/Google-play-logo.svg";
// utils
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";
import clsx from "clsx";
import { createTranslator } from "@/lib/i18n/translator";

DownloadAppCard.propTypes = {
	data: PropTypes.object,
	dict: PropTypes.object,
};

export default function DownloadAppCard({ data, dict = {} }) {
	const t = createTranslator(dict);
	const { title, logo, description, showDownloadAppLinks, appStoreUrl, googlePlayUrl  } = data;
	const containerClasses = `relative w-full overflow-y-hidden flex flex-col pt-8 px-4 md:px-6 items-center justify-center bg-white`;
	const innerContainerClasses = `flex flex-col max-w-[1485px] w-full`;
	const description_ = sanitizeHtml(description);
	const downloadAppLabel = t("DownloadAppCard.lbl_download_app", "download the app");
	const appStoreLabel = t("DownloadAppCard.lbl_app_store", "App Store");
	const googlePlayLabel = t("DownloadAppCard.lbl_google_play", "Google Play");

	return (
		<section
			data-component="DownloadAppCard"
			className={containerClasses}>
			<div className={innerContainerClasses}>
				<div
					className={`flex flex-col bg-alt px-4 py-16 md:px-12 lg:px-20 justify-between items-center gap-6 lg:gap-8 w-full`}
				>
					<div className="flex flex-col items-center text-center gap-16 max-w-[514px]">
						<div className="flex flex-col justify-center items-center gap-5 px-2 lg:px-4 text-center">
							<div className="flex flex-col justify-center items-center gap-3.5 text-center">
								{logo && (
									<div className="relative w-8 h-8">
										<Image
											src={logo?.url}
											alt={logo?.alt || "Description Card Logo"}
											fill
											sizes="32px"
											className="object-contain"
										/>
									</div>
								)}
								{title && (
									<div className="font-futura font-normal uppercase text-secondary text-[20px]">
										{title}
									</div>
								)}
							</div>
							<div
								className={clsx(
									"prose #container-description-dining-card text-center",
									"font-futura font-normal",
									"prose-p:leading-[160%] prose-p:[leading-trim:both] prose-p:[text-edge:cap] prose-p:text-[#5C6974]",
									"prose-p:text-sm md:prose-p:text-base"
								)}
								dangerouslySetInnerHTML={{ __html: description_ }}
							/>
						</div>

						{showDownloadAppLinks &&
							(appStoreUrl || googlePlayUrl) && (
								<div className="flex flex-col gap-6 justify-center items-center">
									<div className="text-secondary font-futura text-[16px] font-normal leading-[16px] tracking-[2.4px] uppercase">
										{downloadAppLabel}
									</div>
									<div className="flex flex-row gap-8 text-secondary text-4xl">
										{appStoreUrl && (
											<a href={appStoreUrl} target="_blank" rel="noopener noreferrer">
												<Image src={AppStore} alt={appStoreLabel} width={40} height={39} />
											</a>
										)}
										{googlePlayUrl&& (
											<a href={googlePlayUrl} target="_blank" rel="noopener noreferrer">
												<Image src={GooglePlay} alt={googlePlayLabel} width={40} height={39} />
											</a>
										)}
									</div>
								</div>
							)}
					</div>
				</div>
			</div>
		</section>
	);
}
