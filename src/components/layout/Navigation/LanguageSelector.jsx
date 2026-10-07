"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";

export default function LanguageSelector({ languages = {} }) {
	const { available = [], default: defLang = "en" } = languages;
	const defaultLanguage = String(defLang || "en").toLowerCase();
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();
	const containerRef = useRef(null);

	const languageOptions = useMemo(
		() => (Array.isArray(available) ? available : []),
		[available],
	);
	const hasDropdownSelector = languageOptions.length > 2;
	const hasSwitchSelector = languageOptions.length === 2;

	const currentLanguage = useMemo(() => {
		const currentSlug = pathname?.split("/").filter(Boolean)?.[0]?.toLowerCase();

		return (
			languageOptions.find((l) => l?.slug?.toLowerCase() === currentSlug) ??
			languageOptions.find((l) => l?.slug?.toLowerCase() === defaultLanguage) ??
			languageOptions[0] ??
			null
		);
	}, [defaultLanguage, languageOptions, pathname]);

	const buildLanguageHref = useCallback(
		(targetSlug) => {
			// NOTE: Keep language change redirecting to home by product decision.
			if (!targetSlug || String(targetSlug).toLowerCase() === defaultLanguage) {
				return "/";
			}

			return `/${targetSlug}`;
		},
		[defaultLanguage],
	);

	const switchLanguage = useMemo(() => {
		if (!hasSwitchSelector || !currentLanguage?.slug) {
			return null;
		}

		const currentSlug = String(currentLanguage.slug).toLowerCase();

		return (
			languageOptions.find(
				(language) =>
					language?.slug && String(language.slug).toLowerCase() !== currentSlug,
			) ?? null
		);
	}, [currentLanguage, hasSwitchSelector, languageOptions]);

	useEffect(() => {
		if (!isOpen || !hasDropdownSelector) return undefined;

		const handleClickOutside = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [hasDropdownSelector, isOpen]);

	useEffect(() => {
		if (!hasDropdownSelector && isOpen) {
			setIsOpen(false);
		}
	}, [hasDropdownSelector, isOpen]);

	const currentLanguageLabel =
		(currentLanguage?.slug || defaultLanguage || "EN").toUpperCase();
	const switchLanguageLabel = (switchLanguage?.slug || "").toUpperCase();

	if (hasSwitchSelector && switchLanguage) {
		return (
			<div className="relative" ref={containerRef}>
				<Link
					prefetch={false}
					href={buildLanguageHref(switchLanguage.slug)}
					className="flex items-center p-2 gap-1 lg:gap-0.5 xl:gap-1 font-futura group-[.active]/header:text-secondary text-white tracking-[clamp(0.9px,0.12vw,2px)] uppercase text-[clamp(12px,0.82vw,15px)] cursor-pointer"
					aria-label={`Switch language to ${switchLanguageLabel}`}
				>
					<span className="group-[.active]/header:text-secondary text-white">{switchLanguageLabel}</span>
				</Link>
			</div>
		);
	}

	return (
		<div className="relative" ref={containerRef}>
			<button
				type="button"
				onClick={() => hasDropdownSelector && setIsOpen((prev) => !prev)}
				className={`flex items-center gap-1 lg:gap-0.5 xl:gap-1 font-futura group-[.active]/header:text-secondary text-white tracking-[clamp(0.9px,0.12vw,2px)] uppercase text-[clamp(12px,0.82vw,15px)] ${hasDropdownSelector ? "cursor-pointer" : "cursor-default"}`}
				aria-expanded={hasDropdownSelector ? isOpen : undefined}
			>
				{currentLanguageLabel}
				{hasDropdownSelector && (
					<svg
						className={`lg:h-3 lg:w-3 xl:h-3.5 xl:w-3.5 group-[.active]/header:text-secondary text-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
						viewBox="0 0 20 20"
						fill="none"
						aria-hidden="true"
					>
						<path
							d="M5.25 7.5 10 12.25 14.75 7.5"
							className="stroke-white group-[.active]/header:stroke-secondary"
							strokeWidth="1.75"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				)}
			</button>

			{hasDropdownSelector && isOpen && languageOptions.length > 0 && (
				<ul className="absolute left-0 lg:right-0 lg:left-auto top-full mt-2 min-w-20 bg-white border border-secondary/20 shadow-md z-50">
					{languageOptions.map((language) => (
						<li key={`nav-lang-${language.slug}`}>
							<Link
								prefetch={false}
								href={buildLanguageHref(language.slug)}
								onClick={() => setIsOpen(false)}
								className="block px-3 py-2 font-futura text-secondary tracking-widest uppercase text-sm hover:bg-accent"
							>
								{(language.slug || "").toUpperCase()}
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
