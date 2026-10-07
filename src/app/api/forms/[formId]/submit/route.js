import { NextResponse } from "next/server";

const FORM_SUBMIT_BASE_URL = process.env.WEB_API_URL;
const WEB_API_HEADER_KEY = process.env.WEB_API_HEADER_KEY;
const WEB_API_TOKEN = process.env.WEB_API_TOKEN;
const SERVER_USER = process.env.SERVER_USER;
const SERVER_PASS = process.env.SERVER_PASS ?? process.env.SERVER_PASSWORD;
const IS_PRODUCTION = process.env.APP_ENV === "production";

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

const isValidFormId = (formId) => /^\d+$/.test(String(formId ?? "").trim());

export async function POST(request, { params }) {
	const resolvedParams = await params;
	const formId = resolvedParams?.formId;

	if (!isValidFormId(formId)) {
		return NextResponse.json({ error: "Invalid form id" }, { status: 400 });
	}

	let payload;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	if (!payload || typeof payload !== "object") {
		return NextResponse.json(
			{ error: "Form payload is required" },
			{ status: 400 },
		);
	}

	try {
		const submitUrl = `${FORM_SUBMIT_BASE_URL}/forms/${formId}/submissions`;
		const response = await fetch(submitUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				...getApiAuthHeaders(),
			},
			body: JSON.stringify(payload),
			cache: "no-store",
		});

		const responseText = await response.text();
		let responseData = {};

		if (responseText) {
			try {
				responseData = JSON.parse(responseText);
			} catch {
				responseData = { message: responseText };
			}
		}

		if (!response.ok) {
			return NextResponse.json(
				{
					error: "Failed to submit form",
					details: responseData,
				},
				{ status: response.status },
			);
		}

		return NextResponse.json(responseData, { status: 200 });
	} catch {
		return NextResponse.json(
			{ error: "Unexpected error submitting form" },
			{ status: 500 },
		);
	}
}
