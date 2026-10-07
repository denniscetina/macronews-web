import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import CardImagesRotating from "./CardImagesRotating";

const CardGallerySwiper = dynamic(() => import("./CardGallerySwiper.client"), {
	ssr: false,
	loading: () => null,
});

const propTypes = {
	card: PropTypes.array,
	labels: PropTypes.object,
};

const CardGallery = ({ cardImages, labels }) => {
	const cardCount = cardImages?.length || 0;

	if (cardCount > 6) {
		return <CardGallerySwiper cardImages={cardImages || []} labels={labels} />;
	}

	return (
		<div
			className={`grid gap-10 pt-16 pb-8 px-6 ${
				cardCount === 1
					? "grid-cols-1"
					: cardCount === 2
						? "grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto"
						: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
			}`}
		>
			{cardImages?.map((card, index) => (
				<div key={`card-feature-images-${index}`}>
					<CardImagesRotating cardCount={cardCount} card={card} labels={labels} />
				</div>
			))}
		</div>
	);
};

CardGallery.propTypes = propTypes;

export default CardGallery;
