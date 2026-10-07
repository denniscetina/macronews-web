"use client";

import { useContext } from "react";
import { AppContext } from "@/context/AppProvider";

export default function Hamburger() {
	const { handleDrawerOpen, isDrawerOpen } = useContext(AppContext);

	return (
		<button
			type="button"
			className="flex flex-col gap-[5px] relative cursor-pointer p-2 hover:bg-accent rounded lg:hidden"
			onClick={() => handleDrawerOpen()}
			aria-expanded={isDrawerOpen}
			aria-label="Toggle menu"
		>
			<div className="w-4 h-[1px] group-[.active]/header:bg-secondary bg-white rounded-[1px] origin-center" />
			<div className="w-3 h-[1px] group-[.active]/header:bg-secondary bg-white rounded-[1px] origin-center" />
			<div className="w-4 h-[1px] group-[.active]/header:bg-secondary bg-white rounded-[1px] origin-center" />
		</button>
	);
}
