import PropTypes from "prop-types";
import RoomCardItem from "./RoomCardItem";

const ListCardPost = ({ items = [], labels = {} }) => {
	return (
		<div className="min-h-auto max-w-full lg:min-h-[300px] w-full flex flex-col gap-[32px] lg:gap-[64px] justify-start items-center">
			{items.map((room, index) => (
				<RoomCardItem
					key={room?.id ?? room?.slug ?? index}
					room={room}
					itemIndex={index}
					labels={labels}
				/>
			))}
		</div>
	);
};

ListCardPost.propTypes = {
	items: PropTypes.array.isRequired,
	labels: PropTypes.object,
};

export default ListCardPost;
