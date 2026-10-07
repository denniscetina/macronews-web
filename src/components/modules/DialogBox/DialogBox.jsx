"use client";
import { motion } from "framer-motion";
// prop-types
import PropTypes from "prop-types";
// utils
import { sanitizeHtml } from "../../utils/SanitizeHtml/SanitizeHtml";

DialogBox.propTypes = {
	data: PropTypes.object,
};
export default function DialogBox({ data }) {
	return (
		<motion.section
			data-component="DialogBox"
			className="relative w-full overflow-y-hidden flex flex-col items-center justify-center self-stretch gap-8 py-8 md:py-16 max-md:px-6 bg bg-[#F7F4F0]"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.8 }}
		>
			<div className="w-full lg:max-w-[1153px] flex flex-col items-center justify-center gap-8">
				{data.dialogBoxes.length > 0 &&
					data.dialogBoxes.map((item, index) => {
						return (
							<div className="w-full h-auto" key={index}>
								{item.title && (
									<div className="font-futura font-[450] leading-[16px] text-secondary border-b border-[#253746] mb-4 pb-2 uppercase text-[16px] tracking-[2.4px]">
										{item.title}
									</div>
								)}
								<div
									className="wysiwyg dialog-box-description text-secondary font-normal leading-[160%] [&_p]:py-4 [&_p]:px-0"
									dangerouslySetInnerHTML={{
										__html: sanitizeHtml(item.description),
									}}
								/>
							</div>
						);
					})}
			</div>
		</motion.section>
	);
}
