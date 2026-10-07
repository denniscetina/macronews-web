
const contactData = ( lang ) =>{
	const data = {
		"en":[
			{
				"market": null,
				"displayName": "Hotel",
				"contactValue": "+529848757700",
				"type": "phone"
			},
			{
				"market": "us-ca",
				"displayName": "USA & Canada",
				"contactValue": "8559458477",
				"type": "phone"
			},
			{
				"market": "mx",
				"displayName": "Mexico",
				"contactValue": "8006819575",
				"type": "phone"
			},
			{
				"market": "ar",
				"displayName": "Argentina",
				"contactValue": "08003459948",
				"type": "phone"
			},
			{
				"market": "cl",
				"displayName": "Chile",
				"contactValue": "800914923",
				"type": "phone"
			},
			{
				"market": "co",
				"displayName": "Colombia",
				"contactValue": "018005191204",
				"type": "phone"
			},
			{
				"market": "br",
				"displayName": "Brazil",
				"contactValue": "551132302549",
				"type": "phone"
			},
			{
				"market": "international",
				"displayName": "Latin America & Rest Of The World",
				"contactValue": "+529934410520",
				"type": "phone"
			}
		],
		"es":[
			{
				"market": null,
				"displayName": "Hotel",
				"contactValue": "+529848757700",
				"type": "phone"
			},
			{
				"market": "us-ca",
				"displayName": "EE. UU. Y CANADÁ",
				"contactValue": "8559458477",
				"type": "phone"
			},
			{
				"market": "mx",
				"displayName": "México",
				"contactValue": "8006819575",
				"type": "phone"
			},
			{
				"market": "ar",
				"displayName": "Argentina",
				"contactValue": "08003459948",
				"type": "phone"
			},
			{
				"market": "cl",
				"displayName": "Chile",
				"contactValue": "800914923",
				"type": "phone"
			},
			{
				"market": "co",
				"displayName": "Colombia",
				"contactValue": "018005191204",
				"type": "phone"
			},
			{
				"market": "br",
				"displayName": "Brasil",
				"contactValue": "551132302549",
				"type": "phone"
			},
			{
				"market": "international",
				"displayName": "LATINOAMÉRICA Y RESTO DEL MUNDO",
				"contactValue": "+529934410520",
				"type": "phone"
			}
		]
	}

	return data[lang];
}

const marketingData = (lang) =>{
	const data = {
		"en": {
			"newsletterPopupEnabled": true,
			"newsletterTriggerSettings": {
				"heading": "Newsletter, Special Offers & News",
				"heading_level": "",
				"description": "<p>Receive the latest promotions, unique experiences, and special news from our hotel straight to your inbox. Be the first to discover new getaways and exclusive benefits.</p>",
				"triggerButtonText": "Sign Up"
			},
			"newsletterPopupSettings": null
		},
		"es": {
			"newsletterPopupEnabled": true,
			"newsletterTriggerSettings": {
				"heading": "Newsletter, Ofertas Especiales y Noticias",
				"heading_level": "",
				"description": "<p>Recibe las últimas promociones, experiencias únicas y noticias especiales de nuestro hotel directamente en tu bandeja de entrada. Sé el primero en descubrir nuevas escapadas y beneficios exclusivos.</p>",
				"triggerButtonText": "Sign Up"
			},
			"newsletterPopupSettings": null
		},
	}

	return data[lang];
}
export {
	contactData,
	marketingData,
}