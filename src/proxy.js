import { NextResponse } from "next/server";

const defaultLocale = 'en';
const locales = ['en', 'es'];

export function proxy(request) {
    const { pathname } = request.nextUrl;
    const requestHeaders = new Headers(request.headers);
	// 1. Definir los patrones maliciosos comunes basados en tus logs
	const blockedPatterns = /\.(php|aspx|jsp|cgi|env|git|bak|sql|ini)$|\/magento_version|\/wp-admin|\/wp-login/i;

	// 2. Interceptar y bloquear la petición si coincide con la lista negra
	if (blockedPatterns.test(pathname)) {
		// Devolvemos un 403 Forbidden inmediatamente sin consultar al servidor de origen
		return NextResponse.json({error: 'Forbidden'}, { status: 403 });
	}

    // 1. Si la URL ya tiene un idioma (ej: /es/nosotros), déjala pasar para que la maneje [[[...slug]]].js
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        // Opcional: Si el usuario entra a /en/..., redirigirlo a la ruta sin /en para URL canónica
        if (pathname.startsWith(`/${defaultLocale}/`) || pathname === `/${defaultLocale}`) {
            const newPath = pathname.replace(`/${defaultLocale}`, '') || '/';
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = newPath;
            return NextResponse.redirect(redirectUrl);
        }
        // Para /es u otros, simplemente continúa.
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // 2. Si la URL NO tiene idioma (ej: /about), reescribe a /en/about para que la maneje [[[...slug]]].js
    const newUrl = request.nextUrl.clone();
    newUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.rewrite(newUrl, {
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        // Excluir archivos internos de Next.js y archivos estáticos
        '/((?!api|preview|_next|favicon.ico|icon.svg|assets|.*\\..*).*)',
    ],
};
