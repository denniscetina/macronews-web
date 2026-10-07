// prop-types
import PropTypes from "prop-types";
import CustomButton from "../../utils/ButtonLink";
// utils
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";

DescriptiveSectionWithImage.propTypes = {
	data: PropTypes.object,
};
export default function DescriptiveSectionWithImage({ data }) {
	const { title, logo, description, mainLink, image, backgroundColor } = data;

	const description_ = sanitizeHtml(description);

	const background =
		backgroundColor === "bg-primary"
			? "#F7F4F0"
			: backgroundColor === "bg-secondary"
				? "#EDE6DE"
				: "#F7F4F0";

	return (
		<section
			data-component="DescriptiveSectionWithImage"
			className={`bg py-16 flex flex-col items-start w-full max-w-[1920px] mx-auto relative`}
			style={{ background }}
		>
			<div className="container flex flex-col items-center w-full mx-auto px-8 lg:px-0 py-8 max-w-6xl gap-8">
				{logo && (
					<div className="flex-shrink-0">
						<img src={logo.url} alt={logo.alt || title} className="h-12" />
					</div>
				)}
				<div className="flex flex-col items-center gap-8 text-center w-full">
					{title && (
						<h2 className="font-normal text-2xl md:text-3xl text-secondary uppercase font-futura [leading-trim:both] leading-[100%] tracking-[2.4px] [text-edge:cap]">
							{title}
						</h2>
					)}
					{description_ && (
						<div
							className="wysiwyg text-lg text-center w-full font-futura body-medium leading-[160%] [leading-trim:both] [text-edge:cap]"
							dangerouslySetInnerHTML={{ __html: description_ }}
						/>
					)}
				</div>
				<img
					src={image.url}
					alt={image.alt || title}
					className="object-cover shadow-2xl lg:max-w-[1153px]"
				/>
				{mainLink && (
					<CustomButton
						config={mainLink}
						useMotion={true}
						styleType="outlined"
					/>
				)}
			</div>
		</section>
	);
}
