import { notFound } from "next/navigation";
import { Inter, Montserrat } from "next/font/google";
import "@/styles/globals.css";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import TopBar from "@/components/layout/TopBar";
import { getEnv, isProduction } from "@/config/env";
import { isLocale, SITE_NAME } from "@/config/site";
import { getDictionary } from "@/i18n";
import { designTokensCss } from "@/lib/design-tokens";
import { getMenu } from "@/server/cms/mappers/site";
import { getSite } from "@/server/services/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

const toUrl = (value) => {
	try {
		return new URL(value);
	} catch {
		return undefined;
	}
};

export async function generateMetadata({ params }) {
	const { lang } = await params;
	if (!isLocale(lang)) {
		return {};
	}
	const site = await getSite();
	const name = site?.name || SITE_NAME;
	const description = site?.brand.tagline || site?.description || undefined;
	const favicon = site?.brand.favicon?.url;

	return {
		metadataBase: toUrl(getEnv().SITE_URL || site?.url),
		title: { default: name },
		description,
		applicationName: name,
		icons: favicon ? { icon: favicon } : undefined,
		openGraph: { siteName: name, type: "website", locale: site?.locale || undefined },
		// QAS / local must never be indexed.
		robots: isProduction() ? undefined : { index: false, follow: false },
	};
}

export default async function RootLayout({ children, params }) {
	const { lang } = await params;
	if (!isLocale(lang)) {
		notFound();
	}

	const [dictionary, site] = await Promise.all([getDictionary(lang), getSite()]);
	const name = site?.name || SITE_NAME;
	const tokens = site ? designTokensCss(site.design) : "";

	return (
		<html lang={lang} className={`${inter.variable} ${montserrat.variable}`}>
			<head>{tokens ? <style id="cms-design-tokens" dangerouslySetInnerHTML={{ __html: tokens }} /> : null}</head>
			<body className="flex min-h-screen flex-col">
				<a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-surface focus:p-3">
					{dictionary.layout.skipToContent}
				</a>
				<TopBar lang={lang} menu={getMenu(site, lang, "secondary")} dictionary={dictionary} />
				<Header
					lang={lang}
					name={name}
					logo={site?.brand.logoLight ?? null}
					logoOnDark={site?.brand.logoDark ?? null}
					menu={getMenu(site, lang, "main")}
					dictionary={dictionary}
				/>
				<main id="main" className="flex-1">
					{children}
				</main>
				<Footer
					lang={lang}
					site={site}
					name={name}
					menu={getMenu(site, lang, "footer")}
					secondaryMenu={getMenu(site, lang, "footerSecondary")}
					legalMenu={getMenu(site, lang, "footerLegal")}
					dictionary={dictionary}
				/>
			</body>
		</html>
	);
}
