import { NextResponse } from "next/server";

const WEB_API_URL = process.env.WEB_API_URL ?? "";

const WEB_API_HEADER_KEY = process.env.WEB_API_HEADER_KEY;
const WEB_API_TOKEN = process.env.WEB_API_TOKEN;
const SERVER_USER = process.env.SERVER_USER;
const SERVER_PASS = process.env.SERVER_PASS ?? process.env.SERVER_PASSWORD;
const IS_PRODUCTION = process.env.APP_ENV === "production";

const buildRecaptchaVerifyUrl = (baseUrl) => {
	if (typeof baseUrl !== "string" || baseUrl.trim() === "") {
		return "";
	}

	const parsedUrl = new URL(baseUrl);
	const sanitizedPath = parsedUrl.pathname.replace(/\/+$/, "");
	parsedUrl.pathname = `${sanitizedPath}/recaptcha/verify`.replace(/\/+/g, "/");
	parsedUrl.search = "";
	parsedUrl.hash = "";

	return parsedUrl.toString();
};

const getApiAuthHeaders = () => {
	const headers = {};

	if (WEB_API_HEADER_KEY && WEB_API_TOKEN) {
		headers[WEB_API_HEADER_KEY] = WEB_API_TOKEN;
	}

	if (!IS_PRODUCTION && SERVER_USER && SERVER_PASS) {
		const basicAuthToken = Buffer.from(`${SERVER_USER}:${SERVER_PASS}`).toString(
			"base64",
		);
		headers.Authorization = `Basic ${basicAuthToken}`;
	}

	return headers;
};

const getRequestCode = (payload) => {
	if (!payload || typeof payload !== "object") {
		return "";
	}

	return typeof payload.code === "string" ? payload.code.trim() : "";
};

const resolveSuccessValue = (payload) => {
	if (!payload || typeof payload !== "object") {
		return false;
	}

	if (typeof payload.success === "boolean") {
		return payload.success;
	}

	// Compatibility fallback when upstream has typo.
	if (typeof payload.sucess === "boolean") {
		return payload.sucess;
	}

	return false;
};

export async function POST(request) {
	const recaptchaVerifyUrl = buildRecaptchaVerifyUrl(WEB_API_URL);

	if (!recaptchaVerifyUrl) {
		return NextResponse.json({ success: false }, { status: 200 });
	}

	let payload;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ success: false }, { status: 200 });
	}

	const code = getRequestCode(payload);
	if (!code) {
		return NextResponse.json({ success: false }, { status: 200 });
	}

	try {
		const response = await fetch(recaptchaVerifyUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				...getApiAuthHeaders(),
			},
			body: JSON.stringify({ code }),
			cache: "no-store",
		});

		let responseData = null;
		try {
			responseData = await response.json();
		} catch {
			responseData = null;
		}

		return NextResponse.json(
			{ success: response.ok && resolveSuccessValue(responseData) },
			{ status: 200 },
		);
	} catch {
		return NextResponse.json({ success: false }, { status: 200 });
	}
}
