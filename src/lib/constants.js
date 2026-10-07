import "server-only"
import localFont from "next/font/local"

export const Futura = localFont({
	variable: "--font-family-futura",
	display: "swap",
	preload: false,
	src: [
		{
			path: "../assets/fonts/FuturaPTLightfont.woff2",
			weight: "300",
			style: "normal",
		},
		{
			path: "../assets/fonts/FuturaPTBookfont.woff2",
			weight: "400",
			style: "normal"
		},
		{
			path: "../assets/fonts/FuturaPTMediumfont.woff2",
			weight: "500",
			style: "normal"
		}
	]
})

export const Glosa = localFont({
	variable: "--font-family-glosa",
	display: "swap",
	preload: false,
	src:[
		{
			path:"../assets/fonts/GlosaDisplayMediumfont.woff2",
			weight:"500",
			style:"normal"
		},
		{
			path: "../assets/fonts/Glosa-Display-Bold.woff2",
			weight:"700",
			style:"normal"
		},
		{
			path: "../assets/fonts/Glosa-Display-Roman.woff2",
			weight:"400",
			style:"normal"
		}
	]
})
