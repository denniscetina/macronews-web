import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/config/site";

const BLOCKED = /\.(php|aspx|jsp|cgi|env|git|bak|sql|ini)$|\/wp-admin|\/wp-login/i;

/**
 * Locale routing: the default locale lives at "/", the others at "/<lang>".
 * Internally everything is rewritten to /<lang>/... so the [lang] segment always exists.
 */
export function proxy(request) {
	const { pathname } = request.nextUrl;

	if (BLOCKED.test(pathname)) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const prefix = LOCALES.find((lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`));

	if (prefix === DEFAULT_LOCALE) {
		const url = request.nextUrl.clone();
		url.pathname = pathname.slice(prefix.length + 1) || "/";
		return NextResponse.redirect(url, 308);
	}
	if (prefix) {
		return NextResponse.next();
	}

	const url = request.nextUrl.clone();
	url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
	return NextResponse.rewrite(url);
}

export const config = {
	matcher: ["/((?!api|preview|revalidate|_next|favicon.ico|.*\\..*).*)"],
};
