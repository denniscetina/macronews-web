"use client";

import { useEffect, useRef } from "react";

const SCROLL_THRESHOLD = 8;

/**
 * `<header>` that knows when the page has been scrolled: it sets `data-scrolled` on itself (DOM only, no re-render),
 * and the CSS in globals.css (`.site-header`) paints it transparent over a hero at the top and red afterwards.
 */
export default function HeaderShell({ className = "", children }) {
	const ref = useRef(null);
	useEffect(() => {
		const update = () => ref.current?.toggleAttribute("data-scrolled", window.scrollY > SCROLL_THRESHOLD);
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, []);
	return (
		<header ref={ref} className={className}>
			{children}
		</header>
	);
}
