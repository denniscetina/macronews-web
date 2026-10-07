"use client";

import clsx from "clsx";

function BookingWidgetPanel({ children, className }) {
	return (
		<div data-slot="panel" className={clsx("w-full", className)}>
			{children}
		</div>
	);
}

export default BookingWidgetPanel;
