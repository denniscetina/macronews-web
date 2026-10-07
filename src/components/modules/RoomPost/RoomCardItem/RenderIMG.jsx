import PropTypes from "prop-types";

const RenderIMG = ({ title, url }) => {
	return (
		<div className="overflow-hidden w-full h-full">
			<img
				src={url}
				alt={title || "Imagen del post"}
				className="w-full h-full min-h-[375px] lg:max-h-full lg:min-w-[530px] xl:min-w-[730px] lg:h-[560px] bg-cover object-cover transition-transform duration-300 hover:scale-105"
			/>
		</div>
	);
};

RenderIMG.propTypes = {
	title: PropTypes.string,
	url: PropTypes.string.isRequired,
};

export default RenderIMG;
