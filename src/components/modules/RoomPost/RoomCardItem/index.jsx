import PropTypes from "prop-types";
import Link from "next/link";
import { sanitizeHtml } from "@/components/utils/SanitizeHtml/SanitizeHtml";
import DetailRomm from "./DetailRom";
import RenderIMG from "./RenderIMG";
import RoomCardBookingAction from "./RoomCardBookingAction.client";
import RoomCardInteractive from "./RoomCardInteractive.client";

const getRoomImage = (room) => {
	const listingImage = room?.listingImage;

	return (
		listingImage?.desktop ??
		listingImage?.tablet ??
		listingImage?.mobile ??
		(Array.isArray(room?.gallery) ? room.gallery[0] : null) ??
		null
	);
};

const getPriceLabel = (price) => {
	if (!price || typeof price !== "object") {
		return "";
	}

	const prefix = typeof price.prefix === "string" ? price.prefix.trim() : "";
	const suffix = typeof price.suffix === "string" ? price.suffix.trim() : "";
	const hasAmount = typeof price.amount === "number" && Number.isFinite(price.amount);
	const amountLabel = hasAmount
		? new Intl.NumberFormat("en-US", {
			maximumFractionDigits: 0,
		}).format(price.amount)
		: "";

	return [prefix, amountLabel, suffix].filter(Boolean).join(" ");
};

const RoomCardItem = ({ room, itemIndex = 0, labels = {} }) => {
	const { goToRoom = "Go to Room", viewDetails = "View Details", hideDetails = "Hide Details" } = labels;
	const hasImagePositionOverride = typeof room?.imagePosition === "boolean";
	const isContentFirst = hasImagePositionOverride
		? room.imagePosition
		: itemIndex % 2 === 0;
	const directionImg = isContentFirst ? "lg:flex-row-reverse" : "lg:flex-row";
	const roomImage = getRoomImage(room);
	const hasDetailData =
		Array.isArray(room?.amenities) && room.amenities.length > 0
			? true
			: (Array.isArray(room?.specifications) && room.specifications.length > 0) ||
				Boolean(room?.virtualTourLink);
	const roomDetails = {
		amenitiesSectionTitle: room?.amenitiesSectionTitle,
		amenities: Array.isArray(room?.amenities) ? room.amenities : [],
		specificationsSectionTitle: room?.specificationsSectionTitle,
		specifications: Array.isArray(room?.specifications)
			? room.specifications
			: [],
		description: room?.subtitle || "",
		link360: room?.virtualTourLink,
	};
	const roomUrl = room?.permalink || (room?.slug ? `/rooms/${room.slug}/` : "#");
	const bookingButtonLabel =
		typeof room?.bookingButtonLabel === "string"
			? room.bookingButtonLabel.trim()
			: "";
	const priceLabel = getPriceLabel(room?.price);

	const ChevronIcon = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="23"
			height="25"
			viewBox="0 0 23 25"
			fill="none"
			className="group-hover:translate-x-2 transition-transform duration-300"
			aria-label="Chevron icon"
			role="img"
		>
			<title>Chevron icon</title>
			<path
				d="M9.43981 16.5068L13.2422 12.2974L9.43981 8.08789"
				stroke="#253746"
				strokeWidth="1.25"
				strokeLinejoin="round"
				className="group-hover:stroke-primary transition-colors duration-300"
			/>
		</svg>
	);
	const image = roomImage ? (
		<RenderIMG
			url={roomImage.url}
			title={roomImage.alt || room?.title}
		/>
	) : (
		<span className="text-gray-400">No image</span>
	);
	const details = <DetailRomm data={roomDetails} />;
	const content = (
		<>
			<div>
				<h3
					className="header-6 font-glosa! text-[25px]! font-[450] leading-[28.8px] capitalize mb-6 line-clamp-2"
					title={room?.title}
				>
					{room?.title}
				</h3>
				{room?.subtitle && (
					<p
						className="font-futura text-[20px] font-[450] leading-[28.8px] tracking-[4.4px] uppercase line-clamp-2"
						title={room.subtitle}
					>
						{room.subtitle}
					</p>
				)}
				{priceLabel && (
					<p className="font-futura text-base leading-[22px] mt-2">
						{priceLabel}
					</p>
				)}
			</div>
			<div
				className="prose [&_p]:text-[16px] [&_p]:leading-[160%] [&_p]:text-[#757575] [&_p]:font-futura content-card-rooms-post overflow-y-auto max-h-[400px] lg:max-h-[450px]"
				dangerouslySetInnerHTML={{
					__html: sanitizeHtml(room?.summary || ""),
				}}
			/>
		</>
	);
	const actions = (
		<Link
			href={roomUrl}
			className="flex justify-start items-center cursor-pointer gap-1 md:gap-2 font-futura font-[700] text-[18px] leading-[23.4px] tracking-[0.3px] group"
		>
			<span className="leading-[16px] text-[18px] font-[400] tracking-[0.3px] group-hover:text-primary transition-colors duration-300">
				{goToRoom}
			</span>
			{ChevronIcon}
		</Link>
	);

	return (
		<RoomCardInteractive
			directionImg={directionImg}
			hasDetailData={hasDetailData}
			positionBtnClose={directionImg === "lg:flex-row-reverse" ? "top-right" : "top-left"}
			image={image}
			details={details}
			content={content}
			actions={actions}
			viewDetailsLabel={viewDetails}
			hideDetailsLabel={hideDetails}
		>
			{bookingButtonLabel ? (
				<RoomCardBookingAction
					roomSlug={room?.slug}
					label={bookingButtonLabel}
				/>
			) : null}
		</RoomCardInteractive>
	);
};

RoomCardItem.propTypes = {
	room: PropTypes.object.isRequired,
	itemIndex: PropTypes.number,
	labels: PropTypes.object,
};

export default RoomCardItem;
