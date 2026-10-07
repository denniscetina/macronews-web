import Link from "next/link";
import Image from "next/image";
import Hamburger from "@/components/layout/Navigation/Hamburger";
import LanguageSelector from "@/components/layout/Navigation/LanguageSelector";
import PhoneButton from "@/components/layout/Navigation/PhoneButton";
import DesktopMenu from "@/components/layout/Navigation/DesktopMenu";
import CollapseBooking from "@/components/layout/Navigation/CollapseBooking";

export default function Header({
								   leftMenu = [],
								   rightMenu = [],
								   languages = {},
								   site = {},
							   }) {
	const {
		logoLight,
		logoDark,
		urn_icon_white,
		urn_icon_copper,
		urn_isotipo_white,
		urn_isotipo_blue
	} = site?.assets || {};
	const lightLogoSrc = logoLight?.url || "/";
	const whiteIconSrc = urn_icon_white?.url || "/";
	const copperIconSrc = urn_icon_copper?.url || "/";
	const whiteIsotipoSrc = urn_isotipo_white?.url || "/";
	const blueIsotipoSrc = urn_isotipo_blue?.url || "/";
	const logoAlt = logoLight?.alt || logoDark?.alt || "Unico Hotel Riviera Maya";
	return (
		<>
			<header
				className="fixed group-[.active.passive]/header:relative top-0 inset-x-0 z-90"
				data-component-layout="header-new"
			>
				<div
					className={`transition-colors duration-300 ease-in-out  w-full px-4 py-4 lg:px-6 xl:px-8 1xl:px-12 group-[:not(.active)]/header:bg-linear-to-b from-black/80 via-black/50 to-transparent group-[.active]/header:bg-alt group-[.active]/header:shadow-lg ##lg:group-[.active]/header:py-0`}>
					{/* Mobile layout: Hamburger | Logo | LangSelector */}
					<div className="relative flex lg:hidden items-center justify-between w-full z-10">
						<Hamburger/>
						<Link href="/"
							  className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-8">
							<div className="relative w-[40px] h-[37px] hidden group-[.active]/header:block">
								<Image
									src={whiteIconSrc}
									alt=""
									aria-hidden
									width={40}
									height={37}
									className="hidden absolute inset-0 w-[40px] h-[37px] object-contain transition-opacity duration-300 opacity-100 group-[.active]/header:opacity-0"
								/>
								<Image
									src={copperIconSrc}
									alt=""
									aria-hidden
									width={40}
									height={37}
									className="absolute inset-0 w-[40px] h-0 object-contain transition-opacity duration-300 opacity-0 group-[.active]/header:opacity-100 group-[.active]/header:h-[37px]"
								/>
							</div>
							<Image
								src={lightLogoSrc}
								alt={logoAlt}
								width={164}
								height={90}
								className="w-[164px] h-[90px] object-contain transition-opacity duration-300 opacity-100 group-[.active]/header:opacity-0 group-[.active]/header:h-0"
							/>
						</Link>

						<LanguageSelector languages={languages}/>
					</div>

					{/* Desktop layout: LangSelector | LeftOptions | Logo | RightOptions | Phone */}
					<div className="flex justify-center">
						<div
							className="hidden lg:grid grid-cols-[auto_1fr_auto_1fr_auto] items-center #lg:gap-4 xl:gap-8 w-full max-w-[1920px]">
							<div className="flex items-center">
								<LanguageSelector languages={languages}/>
							</div>

							<div className="min-w-0">
								<DesktopMenu items={leftMenu} align="end"/>
							</div>

							<div
								className="relative w-[132px] h-[72px] 1xl:w-[200px] 1xl:h-[115px] group-[.active]/header:w-[45px] group-[.active]/header:h-[47px]">
								<Link
									href="/"
									aria-label={logoAlt}
									className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 visible pointer-events-auto group-[.active]/header:opacity-0 group-[.active]/header:invisible group-[.active]/header:pointer-events-none"
								>
									<Image
										data-type="ligh-logo-src"
										src={lightLogoSrc}
										alt={logoAlt}
										width={140}
										height={76}
										priority
										fetchPriority="high"
										className="hidden xl:block 1xl:w-[200px] 1xl:h-[115px] object-contain"
									/>
									<Image
										data-type="white-isotype-src"
										src={whiteIsotipoSrc}
										alt=""
										aria-hidden
										width={45}
										height={47}
										className="block xl:hidden lg:w-[38px] lg:h-[40px] xl:w-[45px] xl:h-[47px] object-contain"
									/>
								</Link>

								<Link
									href="/"
									aria-label={logoAlt}
									className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 invisible pointer-events-none group-[.active]/header:opacity-100 group-[.active]/header:visible group-[.active]/header:pointer-events-auto"
								>
									<Image
										src={blueIsotipoSrc}
										alt={logoAlt}
										width={45}
										height={47}
										className="lg:w-[38px] lg:h-[40px] xl:w-[45px] xl:h-[47px] object-contain"
									/>
								</Link>
							</div>

							<div className="min-w-0">
								<DesktopMenu items={rightMenu} align="start"/>
							</div>

							<div className="flex items-center justify-end lg:min-h-8 lg:min-w-8">
								<PhoneButton/>
							</div>
						</div>
					</div>
				</div>
				<CollapseBooking/>
			</header>

		</>
	);
}
