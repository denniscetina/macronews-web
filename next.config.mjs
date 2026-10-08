/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "cms.macronews.mx", pathname: "/wp-content/**" },
			{ protocol: "http", hostname: "localhost", pathname: "/**" },
		],
		minimumCacheTTL: 60 * 60 * 24 * 30,
	},
	async rewrites() {
		// The CMS (Site Settings > Advanced) calls /revalidate; the handler lives under /api.
		return [{ source: "/revalidate", destination: "/api/revalidate" }];
	},
};

export default nextConfig;
