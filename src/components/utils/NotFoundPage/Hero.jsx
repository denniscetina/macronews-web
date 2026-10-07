import Image from "next/image";
import HotelImage from "./assets/hotel-unico-riviera-maya.jpg"
export default function Hero() {
	return(
		<section
			className="relative"
		>
			<div className="w-full h-[40vh] mdh-[80vh] relative overflow-hidden">
				<Image
					className="w-full h-full relative object-cover"
					title={"Hero Background"}
					src={HotelImage}
					alt={"Hero Background"}
					loading="lazy"
				/>
				{/* Overlay de gradiente */}
				<div className="z-20 absolute inset-0 pointer-events-none bg-gradient-to-b from-black/50 via-transparent to-transparent" />
			</div>
		</section>
	)
}