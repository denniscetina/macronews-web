import { NextResponse } from 'next/server';

const CMS_MULTIMEDIA_DOMAIN = process.env.CMS_MULTIMEDIA_DOMAIN;
const SERVER_USER = process.env.SERVER_USER;
const SERVER_PASS = process.env.SERVER_PASS ?? process.env.SERVER_PASSWORD;
const IS_PRODUCTION = process.env.APP_ENV === "production";

const normalizeCmsDomain = (domain) => {
	if (!domain) {
		return '';
	}

	const formattedDomain =
		domain.startsWith('http://') || domain.startsWith('https://')
			? domain
			: `https://${domain}`;

	try {
		const parsedUrl = new URL(formattedDomain);
		if (parsedUrl.hostname.startsWith('www.')) {
			parsedUrl.hostname = parsedUrl.hostname.slice(4);
		}

		return parsedUrl.toString().replace(/\/$/, '');
	} catch {
		return '';
	}
};

export async function GET(request, { params }) {
	// Construye la URL completa del recurso en el CMS
	const { slug } = await params;
	const resourcePath = slug.join('/');
	const cmsDomain = normalizeCmsDomain(CMS_MULTIMEDIA_DOMAIN);
	if (!cmsDomain) {
		return new NextResponse('CMS multimedia domain is not configured.', {
			status: 500,
		});
	}
	const resourceUrl = `${cmsDomain}/${resourcePath}`;
	const headers = {};

	if (!IS_PRODUCTION && SERVER_USER && SERVER_PASS) {
		const basicAuthToken = Buffer.from(`${SERVER_USER}:${SERVER_PASS}`).toString('base64');
		headers.Authorization = `Basic ${basicAuthToken}`;
	}
	
	try {
		// Obtiene el recurso del CMS
		const response = await fetch(resourceUrl, {
			headers,
		});
		
		if (!response.ok) {
			// Si el CMS devuelve un error (ej. 404), lo pasamos al cliente
			return new NextResponse(response.body, {
				status: response.status,
				statusText: response.statusText,
			});
		}
		
		// Obtiene el cuerpo de la respuesta como un stream
		const readableStream = response.body;
		
		// Crea encabezados limpios, pasando solo el Content-Type.
		// Esto es crucial para evitar conflictos.
		const responseHeaders = new Headers();
		const contentType = response.headers.get('Content-Type');
		if (contentType) {
			responseHeaders.set('Content-Type', contentType);
		}
		
		// Devuelve la imagen como un stream
		return new NextResponse(readableStream, {
			status: 200,
			headers: responseHeaders,
		});
		
	} catch (error) {
		console.error('Error proxying media:', error);
		return new NextResponse('Error fetching the file.', { status: 500 });
	}
}