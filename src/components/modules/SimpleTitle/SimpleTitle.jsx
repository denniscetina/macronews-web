//"use client";
//import { motion } from "framer-motion";
import clsx from "clsx";
import { getSpacingProps} from "@/lib/getSpacingProps";

export default function SimpleTitle({ data }) {
	const spacingProps = getSpacingProps(data?.layout?.spacing || {});
	const background =
		data.backgroundColor === "bg-primary"
			? "#F7F4F0"
			: data.backgroundColor === "bg-secondary"
				? "#EDE6DE"
				: "#F7F4F0";

	return (
		<section
			data-component="SimpleTitle"
			className={clsx("relative w-full overflow-y-hidden flex flex-col", spacingProps.className)}
			style={{...spacingProps.style, background }}
		>
			{data.title && (
				<div className="w-full h-auto xl:container lg:mx-auto">
					<h1
						className="text-center mx-auto text-primary font-normal font-glosa text-[36px] leading-[120%] lg:text-[64px] deprecated:py-[32px] deprecated:lg:py-[64px] capitalize"
						dangerouslySetInnerHTML={{__html: data.title }}
					/>
				</div>
			)}
		</section>
	);
}
