import { AppProvider } from "@/context/AppProvider";
import SiteIntro from "@/components/layout/SiteIntro";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { getWebsiteSettingsData } from "@/lib/website-settings";
import { getDictionarySafe, pickComponentNode } from "@/lib/i18n";
import { ScopedDictionaryProvider } from "@/lib/i18n/ScopedDictionaryProvider";
import { SiteInitProvider } from "@/context/SiteInitProvider";
import BookingWidgetMobileAction from "@/components/utils/BookingWidget/MobileAction";
//import PopupOffers from "@/components/utils/PopupOffers";
import {Futura, Glosa } from "@/lib/constants";
import "../globals.css"
//import "@/app/(styles)/globals.css"
import {GoogleTagManager} from "@next/third-parties/google";
import Script from "next/script";
const APP_ENV = process.env.APP_ENV;
export const metadata = {
  title: "Unico Hotel Riviera Maya",
  description: "Unico Hotel Riviera Maya - All Inclusive Resort",
};

function buildClientDictionary(dictionary = {}) {
	return {
		layout: {
			Navigation: pickComponentNode({
				dictionary,
				type: "layout",
				componentPath: "Navigation",
			}),
		},
		utils: {
			BookingWidget: pickComponentNode({
				dictionary,
				type: "utils",
				componentPath: "BookingWidget",
			}),
		},
	};
}

export default async function RootLayout({ params, children }) {
    const { lang } = await params;
    const dictionary = await getDictionarySafe(lang);
	const clientDictionary = buildClientDictionary(dictionary);
	const mobileActionDictionary = clientDictionary?.utils?.BookingWidget?.MobileAction || {};
    const { site, menu, secondaryMenu, footerMenu, languages } = await getWebsiteSettingsData(lang);
	const { favicon } = site?.assets || {};
	return (
        <html lang={lang} suppressHydrationWarning className={`${Futura.variable} ${Glosa.variable}`}>
			<head>
            	<link rel="icon" type="image/png" href={favicon?.url}/>
				<GoogleTagManager gtmId={"GTM-N22DPSGM"} />
				{
					(["production"].includes(APP_ENV) && site?.analytics?.googleTagManagerId) &&
					<>
						<GoogleTagManager gtmId={site?.analytics?.googleTagManagerId} />
						<meta name="msvalidate.01" content="1ED94907CF3177A91F1C970EDE4029DF" />
						<meta name="google-site-verification" content="JVcp8h-C8hWPVJBdPdtC7kOw5rKWVaogZPrIV6BtTt4" />
					</>
				}
				{
					(["qas"].includes(APP_ENV)) &&
					<>
						<meta name="robots" content="noindex, nofollow" />
						<meta name="google-site-verification" content="JVcp8h-C8hWPVJBdPdtC7kOw5rKWVaogZPrIV6BtTt4" />
					</>
				}
			</head>
			<body>
				<AppProvider>
					<SiteIntro />
					<SiteInitProvider>
						<ScopedDictionaryProvider dictionary={clientDictionary} locale={lang}>
							<Navigation menu={menu} secondaryMenu={secondaryMenu} languages={languages} site={site} />
							{children}
							<Footer menu={footerMenu} dictionary={dictionary} locale={lang} />
							<BookingWidgetMobileAction
								label={mobileActionDictionary.btn_action_book_now}
								ariaLabel={mobileActionDictionary.btn_open_booking_widget}
							/>
						</ScopedDictionaryProvider>
					</SiteInitProvider>
				</AppProvider>
			</body>
    </html>
    );
}
