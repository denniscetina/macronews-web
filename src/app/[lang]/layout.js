import { notFound } from "next/navigation";
import "@/styles/globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { isLocale, SITE_NAME } from "@/config/site";
import { getDictionary } from "@/i18n";
import { getMenu } from "@/server/cms/mappers/site";
import { getSite } from "@/server/services/site";

export const metadata = {
	title: SITE_NAME,
	description: SITE_NAME,
};

export default async function RootLayout({ children, params }) {
	const { lang } = await params;
	if (!isLocale(lang)) {
		notFound();
	}

	const [dictionary, site] = await Promise.all([getDictionary(lang), getSite()]);
	const name = site?.name || SITE_NAME;

	return (
		<html lang={lang}>
			<body className="flex min-h-screen flex-col">
				<a href="#main" className="sr-only focus:not-sr-only">
					{dictionary.layout.skipToContent}
				</a>
				<Header lang={lang} name={name} menu={getMenu(site, lang, "main_menu")} />
				<main id="main" className="flex-1">
					{children}
				</main>
				<Footer name={name} dictionary={dictionary} />
			</body>
		</html>
	);
}
