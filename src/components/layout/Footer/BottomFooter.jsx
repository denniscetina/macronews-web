import FiveDiamondBadge from "@/assets/img/five-diamond-badge.svg";
import UnicoWhite from "@/assets/img/footer-logo-2.svg";
import TripAdvisorBadge from "@/assets/img/tripadvisor-badge.svg";
import Image from "next/image";
import FooterLink from "./FooterLink";
import PamHotels from "@/components/layout/Footer/PamHotels";

export default function BottomFooter({ settings, menu, labels = {} }) {
	const {
		logoAlt = "Unico Hotel Riviera Maya Logo",
		copyright = "Copyright ©",
		awards = "Awards",
		tripadvisorBadge = "TripAdvisor Badge",
		fiveDiamondBadge = "Five Diamond Badge",
	} = labels;
	const currentYear = new Date().getFullYear();

	return (
		<div className="bg-secondary flex flex-col gap-8 md:gap-12 items-center justify-center w-full pb-[120px] md:pb-8 py-12 px-6">
			<div className="flex flex-col items-center">
				<Image src={UnicoWhite} alt={logoAlt} width={160} height={48} className="mb-8 lg:mb-2" />
				<span className="font-futura text-white text-sm text-center">
					{copyright} {currentYear}, {settings?.legalName || "UNICO 20°87° Hotel Riviera Maya"}
				</span>
			</div>
			<div className="relative flex flex-col items-center justify-center border border-white w-full max-w-[680px] px-4 md:px-8 pt-8 pb-5 md:pt-9 md:pb-6 mt-4">
				<p className="font-futura absolute -top-3.5 md:-top-4 bg-secondary px-5 text-white text-2xl leading-none tracking-[2px]">
					{awards}
				</p>
				<div className="badges flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 w-full">
					<Image
						src={TripAdvisorBadge}
						alt={tripadvisorBadge}
						width={96}
						height={80}
						className="order-1 h-auto w-[84px] md:w-[96px]"
					/>
					<Image
						src={FiveDiamondBadge}
						alt={fiveDiamondBadge}
						width={224}
						height={80}
						className="order-2 h-auto w-[150px] md:w-[224px]"
					/>
				</div>
			</div>
			<PamHotels />
			<div className="order-3 flex flex-wrap flex-row gap-4 items-center justify-center w-full">
				{menu.map((link) => (
					<FooterLink
						key={link.id}
						link={link}
						className="font-futura text-white text-xs hover:underline"
					/>
				))}
			</div>
		</div>
	);
}
