import clsx from "clsx";

import palm1_150 from "@/assets/img/palms/palm-1-150.webp";
import palm1_250 from "@/assets/img/palms/palm-1-250.webp";
import palm1_350 from "@/assets/img/palms/palm-1-350.webp";
import palm1_400 from "@/assets/img/palms/palm-1-400.webp";
import palm2_150 from "@/assets/img/palms/palm-2-150.webp";
import palm2_250 from "@/assets/img/palms/palm-2-250.webp";
import palm2_350 from "@/assets/img/palms/palm-2-350.webp";
import palm2_400 from "@/assets/img/palms/palm-2-400.webp";
import palm3_150 from "@/assets/img/palms/palm-3-150.webp";
import palm3_250 from "@/assets/img/palms/palm-3-250.webp";
import palm3_350 from "@/assets/img/palms/palm-3-350.webp";
import palm3_400 from "@/assets/img/palms/palm-3-400.webp";
import palm4_150 from "@/assets/img/palms/palm-4-150.webp";
import palm4_250 from "@/assets/img/palms/palm-4-250.webp";
import palm4_350 from "@/assets/img/palms/palm-4-350.webp";
import palm4_400 from "@/assets/img/palms/palm-4-400.webp";
import palm5_150 from "@/assets/img/palms/palm-5-150.webp";
import palm5_250 from "@/assets/img/palms/palm-5-250.webp";
import palm5_350 from "@/assets/img/palms/palm-5-350.webp";
import palm5_400 from "@/assets/img/palms/palm-5-400.webp";
import palm6_150 from "@/assets/img/palms/palm-6-150.webp";
import palm6_250 from "@/assets/img/palms/palm-6-250.webp";
import palm6_350 from "@/assets/img/palms/palm-6-350.webp";
import palm6_400 from "@/assets/img/palms/palm-6-400.webp";
import palm7_150 from "@/assets/img/palms/palm-7-150.webp";
import palm7_250 from "@/assets/img/palms/palm-7-250.webp";
import palm7_350 from "@/assets/img/palms/palm-7-350.webp";
import palm7_400 from "@/assets/img/palms/palm-7-400.webp";
import palm8_150 from "@/assets/img/palms/palm-8-150.webp";
import palm8_250 from "@/assets/img/palms/palm-8-250.webp";
import palm8_350 from "@/assets/img/palms/palm-8-350.webp";
import palm8_400 from "@/assets/img/palms/palm-8-400.webp";

export const DECORATIVE_LEAVES = {
	leaveStyle1: {
		sources: {
			150: palm1_150,
			250: palm1_250,
			350: palm1_350,
			400: palm1_400,
		},
	},
	leaveStyle2: {
		sources: {
			150: palm2_150,
			250: palm2_250,
			350: palm2_350,
			400: palm2_400,
		},
	},
	leaveStyle3: {
		sources: {
			150: palm3_150,
			250: palm3_250,
			350: palm3_350,
			400: palm3_400,
		},
	},
	leaveStyle4: {
		sources: {
			150: palm4_150,
			250: palm4_250,
			350: palm4_350,
			400: palm4_400,
		},
	},
	leaveStyle5: {
		sources: {
			150: palm5_150,
			250: palm5_250,
			350: palm5_350,
			400: palm5_400,
		},
	},
	leaveStyle6: {
		sources: {
			150: palm6_150,
			250: palm6_250,
			350: palm6_350,
			400: palm6_400,
		},
	},
	leaveStyle7: {
		sources: {
			150: palm7_150,
			250: palm7_250,
			350: palm7_350,
			400: palm7_400,
		},
	},
	leaveStyle8: {
		sources: {
			150: palm8_150,
			250: palm8_250,
			350: palm8_350,
			400: palm8_400,
		},
	},
};

const DEFAULT_SIZES =
	"(min-width: 1536px) 400px, (min-width: 1280px) 350px, (min-width: 768px) 250px, 150px";

const DEFAULT_CLASS_NAME =
	"relative block h-auto w-[150px] md:w-[250px] xl:w-[350px] 2xl:w-[400px] object-contain pointer-events-none";

export function normalizeDecorativePalmKey(value) {
	return typeof value === "string" ? value.trim() : "";
}

function buildSrcSet(sources) {
	const uniqueSources = new Map();

	Object.values(sources).forEach((source) => {
		uniqueSources.set(source.width, source);
	});

	return Array.from(uniqueSources.values())
		.sort((a, b) => a.width - b.width)
		.map((source) => `${source.src} ${source.width}w`)
		.join(", ");
}

export default function DecorativePalmPicture({
	className,
	elementStyle,
	sizes = DEFAULT_SIZES,
	style,
}) {
	const normalizedKey = normalizeDecorativePalmKey(elementStyle);
	const leaf = DECORATIVE_LEAVES[normalizedKey];

	if (!leaf) return null;

	const fallback = leaf.sources[400] || leaf.sources[350] || leaf.sources[250] || leaf.sources[150];

	return (
		<picture>
			<source
				type="image/webp"
				srcSet={buildSrcSet(leaf.sources)}
				sizes={sizes}
			/>
			<img
				src={fallback.src}
				width={fallback.width}
				height={fallback.height}
				alt=""
				aria-hidden="true"
				loading="lazy"
				decoding="async"
				fetchPriority="low"
				className={clsx(DEFAULT_CLASS_NAME, className)}
				style={style}
			/>
		</picture>
	);
}
