"use client";

import { createContext, useContext } from "react";

const noop = () => {};

export const HeaderStateContext = createContext({
	isHeaderActive: false,
	scrollHeaderActive: false,
	setScrollHeaderActive: noop,
	pageHeaderActive: null,
	setPageHeaderActive: noop,
	resetPageHeaderActive: noop,
});

export function useHeaderState() {
	return useContext(HeaderStateContext);
}
