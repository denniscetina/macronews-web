import { sanitizeHtml } from "@/components/utils/SanitizeHtml/SanitizeHtml";
import ContentList from "@/components/utils/ContentList";
import RoomCardItem from "./RoomCardItem";
import RoomPostTabs from "./RoomPostTabs.client";
import { createTranslator } from "@/lib/i18n/translator";

const VALID_HEADING_LEVELS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const normalizeDisplayOrder = (displayOrder) =>
	typeof displayOrder === "string" ? displayOrder.trim().toLowerCase() : "";

const formatCategoryLabel = (category) => {
	const normalizedCategory = String(category ?? "").trim();

	if (!normalizedCategory || normalizedCategory.toLowerCase() === "all") {
		return "All";
	}

	return normalizedCategory
		.replace(/[-_]+/g, " ")
		.replace(/\b\w/g, (char) => char.toUpperCase());
};

function sortRooms(rooms, normalizedDisplayOrder) {
	if (!Array.isArray(rooms)) {
		return [];
	}

	if (normalizedDisplayOrder !== "alphabetical") {
		return rooms;
	}

	return [...rooms].sort((roomA, roomB) => {
		const roomATitle = String(roomA?.title ?? "");
		const roomBTitle = String(roomB?.title ?? "");

		return roomATitle.localeCompare(roomBTitle, undefined, {
			sensitivity: "base",
		});
	});
}

function buildRoomCategories(sortedRooms, roomCategories) {
	if (!sortedRooms.length || !Array.isArray(roomCategories) || !roomCategories.length) {
		return [];
	}

	const grouped = sortedRooms.reduce((acc, room) => {
		const roomCategorySlugs = Array.isArray(room?.categories) ? room.categories : [];

		roomCategories.forEach((category) => {
			const normalizedCategory = String(category?.slug ?? "").trim();

			if (!normalizedCategory || !roomCategorySlugs.includes(normalizedCategory)) {
				return;
			}

			if (!acc[normalizedCategory]) {
				acc[normalizedCategory] = {
					key: normalizedCategory,
					name: formatCategoryLabel(normalizedCategory),
					items: [],
				};
			}

			acc[normalizedCategory].items.push(room);
		});

		return acc;
	}, {});

	return Object.values(grouped);
}

function RoomCardList({ items = [], labels = {} }) {
	return (
		<ContentList
			items={items}
			className="min-h-auto max-w-full lg:min-h-[300px] w-full flex flex-col gap-[32px] lg:gap-[64px] justify-start items-center"
			getKey={(room, index) => room?.id ?? room?.slug ?? index}
			renderItem={(room, index) => (
				<RoomCardItem
					room={room}
					itemIndex={index}
					labels={labels}
				/>
			)}
		/>
	);
}

export default function RoomPost ({ data, dict = {} }) {
	const t = createTranslator(dict);
	const labels = {
		goToRoom: t("RoomCardItem.btn_go_room", "Go to Room"),
		viewDetails: t("RoomCardItem.btn_view_details", "View Details"),
		hideDetails: t("RoomCardItem.btn_hide_details", "Hide Details"),
	};
	const heading = data?.heading || data?.title;
	const headingLevel =
		typeof data?.headingLevel === "string"
			? data.headingLevel.trim().toLowerCase()
			: "";
	const HeadingTag = VALID_HEADING_LEVELS.has(headingLevel) ? headingLevel : "h3";
	const showSectionHeader = data?.displaySectionHeader !== false;
	const description = typeof data?.description === "string" ? data.description : "";
	const normalizedDisplayOrder = normalizeDisplayOrder(data?.displayOrder);
	const dataFilters =  data?.filters ?? [];
	const roomCategories =  dataFilters?.categories && dataFilters?.categories.length ? dataFilters?.categories : [];
	const sortedRooms = sortRooms(data?.rooms, normalizedDisplayOrder);
	const listCategories = buildRoomCategories(sortedRooms, roomCategories);

	const hasTabs = listCategories.length > 1;

	return (
		<section data-component="RoomPost" className="pt-[64px] pb-[128px] container bg-base2">
			{showSectionHeader && (
				<div className="inner-container flex flex-col gap-[16px] justify-center items-center text-center">
					{heading && (
						<HeadingTag className="header-6 lg:header-5 font-futura! uppercase leading-[20px]! tracking-[2.4px]!">
							{heading}
						</HeadingTag>
					)}
					{description && (
						<div
							className="wysiwyg"
							dangerouslySetInnerHTML={{
								__html: sanitizeHtml(description),
							}}
						/>
					)}
				</div>
			)}
			<div className="inner-container mt-[40px]">
				{sortedRooms.length === 0 ? null
					:
					hasTabs ? (
					<RoomPostTabs
						tabs={listCategories.map((category) => ({
							key: category.key,
							label: category.name,
						}))}
					>
						{listCategories.map((item) => (
							<RoomCardList
								key={`room-post-category-${item.key}`}
								items={item.items}
								labels={labels}
							/>
						))}
					</RoomPostTabs>
				) : (
					<RoomCardList items={sortedRooms} labels={labels} />
				)}
			</div>
		</section>
	);
}
