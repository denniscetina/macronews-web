"use client";

import { useEffect } from "react";
import { useHeaderState } from "@/components/layout/Navigation/HeaderStateContext";

export default function PageHeaderStateSync({ headerStyle }) {
	const { setPageHeaderActive, resetPageHeaderActive } = useHeaderState();

	useEffect(() => {
		setPageHeaderActive(headerStyle === "solid" ? true : null);

		return () => {
			resetPageHeaderActive();
		};
	}, [headerStyle, resetPageHeaderActive, setPageHeaderActive]);

	return null;
}
