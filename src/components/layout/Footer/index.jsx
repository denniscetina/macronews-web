import AppStore from "@/assets/img/Appstore-logo.svg";
import Facebook from "@/assets/img/facebook-logo.svg";
import GooglePlay from "@/assets/img/Google-play-logo.svg";
import Instagram from "@/assets/img/Instagram-logo.svg";
import FooterLogoBlack from "@/assets/img/unico-logo-riviera-maya-hotel.webp";
import Youtube from "@/assets/img/Youtube-logo.svg";
import TiktokIcon from "@/components/icons/Tiktok";
import ContactLink from "./ContactLink";
import FooterLink from "./FooterLink";
import Image from "next/image";
import Link from "next/link";
import NewsletterSignup from "@/components/layout/Footer/NewsletterSignup";
import FooterMobileNav from "@/components/layout/Footer/FooterMobileNav";
import BottomFooter from "@/components/layout/Footer/BottomFooter";
import { createTranslator, pickComponentMessages } from "@/lib/i18n";
//import StayConnected from "@/components/modules/StayConnectedPopUp/StayConnectedPopUp";
import {contactData, marketingData} from "@/components/layout/Footer/STATIC_DATA";

const socialAppsPlatformLogos = {
	facebook: {
		type: "img",
		"content": Facebook
	},
	instagram: {
		type: "img",
		"content": Instagram
	},
	youtube: {
		type: "img",
		"content": Youtube
	},
	tiktok: {
		type: "component",
		"content": < TiktokIcon className="fill-secondary" />
	}
};

export default function Footer({ menu, dictionary, locale }) {
	const footerMessages = pickComponentMessages({
		dictionary,
		type: "layout",
		componentPath: "Footer",
	});
	const mobileMessages = pickComponentMessages({
		dictionary,
		type: "layout",
		componentPath: "Footer.FooterMobileNav",
	});
	const bottomMessages = pickComponentMessages({
		dictionary,
		type: "layout",
		componentPath: "Footer.BottomFooter",
	});
	const t = createTranslator(footerMessages);
	const tMobile = createTranslator(mobileMessages);
	const tBottom = createTranslator(bottomMessages);

	const footerLabels = {
		downloadApp: t("lbl_download_app", "Download Our App:"),
		appStoreLink: t("lnk_app_store_link", "App Store Link"),
		appStore: t("lbl_app_store", "App Store"),
		googlePlayLink: t("lnk_google_play_link", "Google Play Link"),
		googlePlay: t("lbl_google_play", "Google Play"),
		linksOfInterest: t("lnk_links_interest", "Links of Interest"),
		contactUs: t("lbl_contact_us", "Contact Us"),
	};

	const mobileLabels = {
		contactUs: tMobile("lbl_contact_us", footerLabels.contactUs),
		linksOfInterest: tMobile("lnk_links_interest", footerLabels.linksOfInterest),
		expand: "expand",
	};

	const bottomLabels = {
		logoAlt: tBottom(
			"lbl_unico_hotel_riviera_maya_logo",
			"Unico Hotel Riviera Maya Logo",
		),
		copyright: tBottom("lbl_copyright", "Copyright ©"),
		awards: tBottom("lbl_awards", "Awards"),
		tripadvisorBadge: tBottom("lbl_tripadvisor_badge", "TripAdvisor Badge"),
		fiveDiamondBadge: tBottom("lbl_five_diamond_badge", "Five Diamond Badge"),
	};

	const { footerMenu = [], footerSecondaryMenu = [], settings } = menu;
	const footerMenuOne = footerMenu.slice(0, 10);
	const footerMenuTwo = footerMenu.slice(10);
	const { socialApps, marketinLegacy, contactsLegacy } = settings;

	const contacts = contactData(locale) ?? contactData("en")
	const marketing = marketingData(locale) ?? marketingData("en")

	const contactColumnOne = contacts?.slice(0, contacts.length / 2) || [];
	const contactColumnTwo = contacts?.slice(contacts.length / 2) || [];

	return (
		<footer>
			<div className="footer-content-01 bg-white flex flex-col lg:flex-row items-center justify-around gap-0 lg:gap-x-4 xl:gap-x-24 lg:items-start justify-center px-6 2xl:px-32 py-8 lg:py-16 w-full">
				<div className="order-2 lg:order-1 flex flex-col gap-8 items-start mb-10 lg:mb-0">
					<div className="flex flex-col gap-10 items-center w-full">
						<Link href="/">
							<Image src={FooterLogoBlack} preload={false} priority={false} alt="Logo" className="w-36 h-20" />
						</Link>
						<div className="flex flex-row gap-8 items-center">
							{socialApps?.platforms?.items.map((item, indexPlatform) => (
								<a
									key={`${item.key}_${indexPlatform}`}
									href={item.url}
									target="_blank"
									className="text-secondary text-3xl"
								>
									{
										socialAppsPlatformLogos[item.key].type === "img" ? (
											<Image src={socialAppsPlatformLogos[item.key].content} alt={item.label} />
										):(
											socialAppsPlatformLogos[item.key].content
										)
									}
								</a>
							))}
						</div>
					</div>
					{(socialApps?.appStoreUrl || socialApps?.googlePlayUrl) && (
						<div className="hidden lg:flex flex-col gap-4 items-center w-48">
							<span className="font-glosa text-secondary text-base text-center">
								{footerLabels.downloadApp}
							</span>
							<div className="flex flex-row gap-8 text-secondary text-4xl">
								{socialApps?.appStoreUrl && (
									<a
										href={socialApps.appStoreUrl}
										target="_blank"
										title={footerLabels.appStoreLink}
									>
										<Image src={AppStore} alt={footerLabels.appStore} />
									</a>
								)}
								{socialApps?.googlePlayUrl && (
									<a
										href={socialApps.googlePlayUrl}
										target="_blank"
										title={footerLabels.googlePlayLink}
									>
										<Image src={GooglePlay} alt={footerLabels.googlePlay} />
									</a>
								)}
							</div>
						</div>
					)}
				</div>
				<FooterMobileNav
					linksOne={footerMenu}
					linksTwo={footerSecondaryMenu}
					contactCol1={contactColumnOne}
					contactCol2={contactColumnTwo}
					labels={mobileLabels}
				/>
				<div className="order-3 hidden lg:flex flex-row gap-12 items-start justify-between w-full max-w-4xl">
					<div className="flex flex-col gap-4 items-start">
						<span className="header-base text-secondary">{footerLabels.linksOfInterest}</span>
						<div className="flex flex-row gap-8">
							<div className="flex flex-col gap-2 text-secondary text-base">
								{footerMenuOne.map((link) => (
									<FooterLink key={link.id} link={link} />
								))}
							</div>
							<div className="flex flex-col gap-2 text-secondary text-base">
								{footerMenuTwo.map((link) => (
									<FooterLink key={link.id} link={link} />
								))}
							</div>
						</div>
					</div>
					<div className="lg:self-stretch shrink-0 w-px bg-secondary" />
					<div className="flex flex-col gap-4 items-start">
						<span className="header-base text-secondary">{footerLabels.contactUs}</span>
						<div className="flex flex-col lg:flex-row gap-x-8 text-secondary text-base">
							<div>
								{contactColumnOne.map((info, i) => (
									<ContactLink info={info} key={`d-c1-${i}`} />
								))}
							</div>
							<div>
								{contactColumnTwo.map((info, i) => (
									<ContactLink info={info} key={`d-c2-${i}`} />
								))}
							</div>
						</div>
					</div>
				</div>
				<div className="order-1 lg:order-4 w-64 mb-10 lg:mb-0">
					<NewsletterSignup newsletter={marketing} />
				</div>
			</div>
			<BottomFooter settings={settings} menu={footerSecondaryMenu} labels={bottomLabels} />
		</footer>
	);
}
