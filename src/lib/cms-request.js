import "server-only";

const CMS_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

// TODO: Replace the browser-like User-Agent once the WAF allowlists
// a dedicated server-to-server identifier:
// PAM-Server-Agent/1.0 (+https://unicohotelrivieranayarit.com)

/**
 * @param {{ authHeaders?: Record<string, string>, headers?: Record<string, string> }} params
 * @returns {Record<string, string>}
 * @description Build shared headers for CMS API server-to-server requests
 */
export function getCmsRequestHeaders({ authHeaders = {}, headers = {} } = {}) {
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        'User-Agent': CMS_USER_AGENT,
        ...authHeaders,
        ...headers,
    };
}

