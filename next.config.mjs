/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'standalone',
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.unicohotelrivieranayarit.com",
				pathname: "/wp-content/**",
		  	},
			{
				protocol: "https",
				hostname: "**.unicohotelrivieranayarit.com",
		  	},
			{
				protocol: "https",
				hostname: "www.qascms.unicohotelrivieranayarit.com",
				pathname: "/wp-content/**",
			},
			{
				protocol: "https",
				hostname: "**.unicohotelrivieranayarit.com",
			},
			{
				protocol: "http",
				hostname: "localhost",
				port: "",
				pathname: "/**",
			},
		],
		minimumCacheTTL: 60 * 60 * 24 * 30,
		qualities: [60, 70,75,80,85],
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
	  },
	async headers(){
		return [
			{
				source: "/media/:path*",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, s-maxage=31536000, immutable",
					}
				]
			}
		]
	},
	async redirects(){
		return [
			{
				source: "/es/inicio",
				destination:"/es",
				permanent: true,
			},
			{
				source: "/home",
				destination:"/",
				permanent: true,
			},
			{
				source: "/spa",
				destination:"/esencia-wellness-spa",
				permanent: true,
			},
			{
				source: "/offers/superbia-summer-2025",
				destination:"/offers/superbia-summer-exclusive",
				permanent: true,
			}
		]
	}
};

export default nextConfig;
