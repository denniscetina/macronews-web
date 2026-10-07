"use client";
import { useState, useEffect, useRef } from "react";

export default function OnScrollReveal({ children }) {
	const [isScrolled, setIsScrolled] = useState(false);
	const sentinelRef = useRef(null);

	useEffect(() => {
		const updateFromScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		if (!("IntersectionObserver" in window)) {
			updateFromScroll();
			window.addEventListener("scroll", updateFromScroll, { passive: true });

			return () => {
				window.removeEventListener("scroll", updateFromScroll);
			};
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsScrolled(!entry.isIntersecting);
			},
			{ threshold: 0 }
		);

		const sentinel = sentinelRef.current;

		if (sentinel) {
			observer.observe(sentinel);
		}

		return () => {
			if (sentinel) {
				observer.unobserve(sentinel);
			}
			observer.disconnect();
		};
	}, []);

	return (
		<div className="relative">
			<div ref={sentinelRef} aria-hidden className="absolute top-0 h-[50vh] w-full pointer-events-none" />
			<div className={`group/header ${isScrolled ? "scrolled" : ""}`}>
				{children}
			</div>
		</div>
	);
}