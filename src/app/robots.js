export default function robots(){
	const IS_PRODUCTION = process.env.APP_ENV === "production"
	if(IS_PRODUCTION){
		return {
			rules: {
				userAgent: '*',
				allow: '/',
				disallow: ['/draft', '/disable-draft', '/preview', '/api']
			},
			sitemap: 'https://www.unicohotelrivieramaya.com/sitemap.xml',
		};
	}
	return {
		rules: {
			userAgent: '*',
			disallow: '/'
		},
	};
}