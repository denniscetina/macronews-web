// helpers
import isNull from "lodash/isNull";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
const captchaId = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
const validationUrl = "/api/recaptcha/verify";

export function useRecaptcha(options = false) {
	const recaptchaRef = useRef(null);
	const renderInModal =
		typeof options === "object" ? Boolean(options?.renderInModal) : Boolean(options);
	const [verified, setVerified] = useState(false);
	const [error, setError] = useState(null);

	const handleRecaptcha = async (token) => {
		if (!token) {
			setVerified(false);
			return;
		}

		try {
			const response = await fetch(validationUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ code: token }),
			});
			const responseData = await response.json();

			if (responseData?.success === true) {
				setVerified(true);
				setError(null);
			} else {
				recaptchaRef.current?.reset();
				setError("Recaptcha verification failed. Please try again.");
				setVerified(false);
				setTimeout(() => {
					setError(null);
				}, 7000);
			}
		} catch {
			recaptchaRef.current?.reset();
			setError("Unable to verify Recaptcha. Please try again.");
			setVerified(false);
			setTimeout(() => {
				setError(null);
			}, 7000);
			return;
		}
	};

	const child = (
		<>
			{!isNull(error) && (
				<div
					className="w-full p-4 mb-2 text-sm text-red-800 rounded-md border border-red-200 bg-red-50"
					role="alert"
				>
					{error}
				</div>
			)}
			{captchaId ? (
				<ReCAPTCHA
					hl="en"
					ref={recaptchaRef}
					sitekey={captchaId}
					onChange={handleRecaptcha}
					onExpired={() => setVerified(false)}
					onErrored={() => {
						setError("Recaptcha failed to load. Please refresh and try again.");
						setVerified(false);
					}}
					className={`flex justify-center w-full mt-8 ${renderInModal ? "z-499" : ""}`}
				/>
			) : (
				<div
					className="w-full p-4 mb-2 text-sm text-red-800 rounded-md border border-red-200 bg-red-50"
					role="alert"
				>
					Recaptcha site key is not configured.
				</div>
			)}
		</>
	);

	return {
		RenderRecaptcha: child,
		verified,
	};
}

export default useRecaptcha;
