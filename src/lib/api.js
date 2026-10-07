import 'server-only'
import { cache } from 'react'
import { draftMode} from "next/headers";
import { rewriteCmsUrls } from "./rewriteCmsUrls";

const IS_PRODUCTION = process.env.APP_ENV === "production";

/**
 * @param apiHeaderKey
 * @param apiToken
 * @param serverUser
 * @param serverPass
 * @returns {{}|{Authorization: string}|null}
 * @description Get API authentication headers based on environment variables
 */
function getApiAuthHeaders({ apiHeaderKey, apiToken, serverUser, serverPass }) {
    if (!apiHeaderKey || !apiToken) {
        return null;
    }

    const headers = {
        [apiHeaderKey]: apiToken,
    };

    if (IS_PRODUCTION) {
        return headers;
    }

    return {
        ...headers
    };
}

/**
 *
 * @param path
 * @param draftMode
 * @returns {Promise<any|null>}
 * @description Fetch data from API using cache or draft mode if enabled
 */
async function fetchAPI(path, draftMode = false) {
    const API_URL = process.env.WEB_API_URL;
    const API_URL_PREVIEW = process.env.WEB_API_URL_PREVIEW;
    const API_HEADER_KEY = process.env.WEB_API_HEADER_KEY;
    const API_TOKEN = process.env.WEB_API_TOKEN;

    if (!API_URL) {
        console.error("API URL is not defined in environment variables.");
        return null;
    }

    const authHeaders = getApiAuthHeaders({
        apiHeaderKey: API_HEADER_KEY,
        apiToken: API_TOKEN
    });

    if (!authHeaders) {
        console.error(
            "API authentication headers are not configured. Verify WEB_API_HEADER_KEY, WEB_API_TOKEN and non-production basic auth credentials.",
        );
        return null;
    }

	//Validate if path has not leading slash
	if (path.startsWith('/')) {
		path = path.slice(1);
    }

    const url = new URL(`${draftMode ? API_URL_PREVIEW : API_URL}/${path}`);
	const headers = {
		'Content-Type': 'application/json',
		...authHeaders,
	};
	const defaultOptions = draftMode
		? {
			headers,
			cache: "no-store",
		}
		: {
			headers,
			next: {
				revalidate: 3600,
				...(path === "site" ? { tags: ["layout"] } : {}),
			},
		};

    try {
        const response = await fetch(url, defaultOptions);
		console.log(`Getting data from ${url} - status: ${response.status} `);
		// response with status 200 always return json response
		if(response.ok){
			return response.json();
		}
		// Resource doesn't exist
		if(response.status === 404) {
			//Redirect data for 404 error: page not found
			console.error(`Resource doesn't exist: ${url}`);
			//return null or empty array makes nextjs refresh data
			return null;
		}

		//500, timeout, gateway, etc - Just throw an except to keep data cached if exist
		throw new Error(`Error getting data from: ${response.status}:${url}`);
    } catch (error) {
		console.error(`Network or fetch error for ${url}`, error);
		throw error;
    }
}

/**
 * @param {string} path
 * @param {boolean} draftMode
 * @returns {Promise<any>}
 * @description Fetch page data from API using cache or draft mode if enabled
 */
const getCacheData = cache( async (path, draftMode = false)=>{
    return await fetchAPI(path, draftMode)
})

/**
 * @returns {Promise<any>}
 * @description Fetch website settings from API using direct cache for better performance
 */
export const getWebsiteSettings = cache(async  () => {
    const path = 'site';
    return rewriteCmsUrls(await fetchAPI(path, false));
})

/**
 * Fetch page data
 * @param {{ slug: string, type: string }} param0
 * @returns {Promise<any>}
 * @description Fetch page data from API using cache or draft mode if enabled
 */
export async function getPageData({ slug, type = '' }) {
    const { isEnabled } = await draftMode()
    const normalizedType = typeof type === 'string' ? type.trim() : '';
    const normalizedSlug = String(slug ?? '').trim();
    const lowerSlug = normalizedSlug.toLowerCase();
    const hasInvalidSlug = !normalizedSlug || lowerSlug === 'null' || lowerSlug === 'undefined';

    if (hasInvalidSlug) {
        console.error(`API Error: invalid slug for getPageData (type: ${normalizedType || 'pages'})`, { slug });
        return null;
    }

	let path = `${normalizedType}${normalizedType === '' ? '' : '/'}${normalizedSlug}`;
	//let path = normalizedSlug;
    if (normalizedType === 'forms') {
        path = normalizedSlug.startsWith('forms/') ? normalizedSlug : `forms/${normalizedSlug}`;
    }
    const data = await getCacheData(path, isEnabled)
    return rewriteCmsUrls(data);
}
