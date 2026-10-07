"use client";

import dynamic from "next/dynamic";

const BtnAnimated = dynamic(
	() => import("@/components/utils/ButtonAnimated/BtnAnimated"),
	{ ssr: false, loading: () => null },
);

export default function CardImageWithTextButton({ button, styleButton }) {
	if (!button?.url) {
		return null;
	}

	return <BtnAnimated button={button} styleButton={styleButton} />;
}
