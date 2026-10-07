"use client";

import dynamic from "next/dynamic";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppProvider";

const INTRO_STORAGE_KEY = "introShown";

const SiteIntroAnimation = dynamic(() => import("./SiteIntroAnimation.client"), {
	ssr: false,
	loading: () => <SiteIntroFallback />,
});

function hasIntroBeenShown() {
	try {
		return window.sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}

function markIntroAsShown() {
	try {
		window.sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
	} catch {
		// Keep the in-memory React state as the source of truth if storage fails.
	}
}

function SiteIntroFallback() {
	return (
		<div className="w-screen h-screen overflow-hidden absolute inset-0 z-100 flex items-center justify-center bg-[linear-gradient(347deg,_rgba(231,231,231,1)_0%,_rgba(255,255,255,1)_30%,_rgba(255,255,255,1)_70%,_rgba(231,231,231,1)_100%)]" />
	);
}

export default function SiteIntro() {
	const { isIntroShown, setIsIntroShown } = useContext(AppContext);
	const [shouldLoadIntro, setShouldLoadIntro] = useState(false);
	const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

	useEffect(() => {
		let isCancelled = false;

		queueMicrotask(() => {
			if (isCancelled) {
				return;
			}

			if (hasIntroBeenShown()) {
				setIsIntroShown(true);
			} else {
				setShouldLoadIntro(true);
			}

			setHasCheckedStorage(true);
		});

		return () => {
			isCancelled = true;
		};
	}, [setIsIntroShown]);

	const handleIntroComplete = () => {
		markIntroAsShown();
		setIsIntroShown(true);
	};

	if (isIntroShown) {
		return null;
	}

	if (!hasCheckedStorage) {
		return <SiteIntroFallback />;
	}

	if (!shouldLoadIntro) {
		return null;
	}

	return <SiteIntroAnimation onComplete={handleIntroComplete} />;
}
