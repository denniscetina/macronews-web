"use client"
import { useEffect, useState } from "react";

const useTestMode = ({ isTestMode = false }) => {
	const [isTestModeState, setIsTestMode] = useState(isTestMode);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const hostname = window.location.hostname.replace(/^www\./, "");
		const pathname = window.location.pathname.replace(/\/$/, "");
		const isHomeDomain =
			hostname === "unicohotelrivieramaya.com" &&
			(pathname === "" || pathname === "/");

		if (isHomeDomain) {
			setIsTestMode(false);
		} else {
			setIsTestMode(isTestMode);
		}
	}, [isTestMode]);

	return isTestModeState;
};

export default useTestMode;
