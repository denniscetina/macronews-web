import aloftSantoDomingo from "@/assets/img/brands/aloft-santo-domingo.png";
import avaResortCancun from "@/assets/img/brands/ava-resort-cancun.png";
import edenRocMiamiBeach from "@/assets/img/brands/eden-roc-miami-beach.png";
import hardRockHotelAllInclusive from "@/assets/img/brands/hard-rock-hotel-all-inclusive.png";
import marriottSantoDomingoPiantini from "@/assets/img/brands/marriott-santo-domingo-piantini.png";
import nobuHotelLosCabos from "@/assets/img/brands/nobu-hotel-los-cabos.png";
import nobuResidencesLosCabos from "@/assets/img/brands/nobu-residences-los-cabos.png";
import pamHotels from "@/assets/img/brands/pam-hotels.webp";
import residenceInnMeridaCancunPlayaDelCarmen from "@/assets/img/brands/residence-inn-merida-cancun-playa-del-carmen.png";
import unicoHotelCollection from "@/assets/img/brands/unico-hotel-collection.png";
import Image from "next/image";

const brandLogos = [
	{
		src: hardRockHotelAllInclusive,
		alt: "Hard Rock Hotel All Inclusive",
		width: 64,
		height: 28,
		className: "w-[54px] md:w-[64px] h-auto",
	},
	{
		src: unicoHotelCollection,
		alt: "Unico Hotel Collection",
		width: 84,
		height: 24,
		className: "w-[72px] md:w-[84px] h-auto",
	},
	{
		src: avaResortCancun,
		alt: "AVA Resort Cancun",
		width: 58,
		height: 10,
		className: "w-[50px] md:w-[58px] h-auto",
	},
	{
		src: edenRocMiamiBeach,
		alt: "Eden Roc Miami Beach",
		width: 72,
		height: 20,
		className: "w-[62px] md:w-[72px] h-auto",
	},
	{
		src: nobuHotelLosCabos,
		alt: "Nobu Hotel Los Cabos",
		width: 92,
		height: 16,
		className: "w-[82px] md:w-[92px] h-auto",
	},
	{
		src: nobuResidencesLosCabos,
		alt: "Nobu Residences Los Cabos",
		width: 84,
		height: 36,
		className: "w-[74px] md:w-[84px] h-auto",
	},
	{
		src: aloftSantoDomingo,
		alt: "Aloft Santo Domingo",
		width: 62,
		height: 26,
		className: "w-[54px] md:w-[62px] h-auto",
	},
	{
		src: marriottSantoDomingoPiantini,
		alt: "Marriott Santo Domingo Piantini",
		width: 68,
		height: 40,
		className: "w-[58px] md:w-[68px] h-auto",
	},
	{
		src: residenceInnMeridaCancunPlayaDelCarmen,
		alt: "Residence Inn Merida Cancun Playa Del Carmen",
		width: 98,
		height: 28,
		className: "w-[96px] md:w-[98px] h-auto",
	},
];

export default function PamHotels() {
	return (
		<div className="w-full max-w-[1040px] flex flex-col items-center gap-5 md:gap-6 pt-8 md:pt-12">
			<div className="relative w-full flex items-center justify-center pb-8">
				<div className="w-full h-px bg-white/60" />
				<Image
					src={pamHotels}
					alt="Pam Hotels"
					width={130}
					height={54}
					className="absolute bg-secondary px-3 md:px-5 w-[108px] md:w-[130px] h-auto"
				/>
			</div>

			<div className="hidden md:flex w-full items-center justify-between gap-4 lg:gap-5">
				{brandLogos.map((brand) => (
					<Image
						key={brand.alt}
						src={brand.src}
						alt={brand.alt}
						width={brand.width}
						height={brand.height}
						className={brand.className}
					/>
				))}
			</div>

			<div className="grid md:hidden grid-cols-2 gap-x-10 gap-y-5 items-center justify-items-center">
				{brandLogos.map((brand, index) => (
					<Image
						key={brand.alt}
						src={brand.src}
						alt={brand.alt}
						width={brand.width}
						height={brand.height}
						className={`${brand.className} ${index === brandLogos.length - 1 ? "col-span-2" : ""}`}
					/>
				))}
			</div>
		</div>
	);
}
