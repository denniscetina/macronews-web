import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const KNOWN_LANGS = ["en", "es"];
const DEFAULT_PREVIEW_LANG = process.env.PREVIEW_DEFAULT_LANG || "en";
const LAYOUT_REVALIDATE_TARGET = "layout";
const LAYOUT_CACHE_TAG = "layout";

/**
 * @param {string} target
 * @returns {string}
 * @description Normalize revalidation target value
 */
function normalizeTarget(target) {
	return String(target || "").trim().toLowerCase();
}

/**
 * @param {string} token
 * @returns {NextResponse|null}
 * @description Validate revalidation token
 */
function validateRevalidateToken(token) {
	const REVALIDATE_TOKEN = process.env.REVALIDATE_TOKEN ?? process.env.DRAFT_MODE_TOKEN;

	if (!REVALIDATE_TOKEN) {
		return NextResponse.json(
			{ error: "REVALIDATE_TOKEN is not configured" },
			{ status: 500 },
		);
	}

	if (token !== REVALIDATE_TOKEN) {
		return NextResponse.json({ error: "Invalid token" }, { status: 401 });
	}

	return null;
}

/**
 * @param {string} path
 * @returns {string}
 * @description Normalize path value with default language
 */
function normalizePathValue(path) {
	const cleaned = String(path || "")
		.trim()
		.split("?")[0]
		.split("#")[0]
		.replace(/^\/+|\/+$/g, "");

	if (!cleaned) {
		return "/";
	}

	return `/${cleaned}`;
}

/**
 * @param {string} slug
 * @returns {string[]}
 * @description Normalize preview slug with default language
 */
function normalizePreviewSlug(slug) {
	const segments = String(slug || "")
		.trim()
		.replace(/^\/+|\/+$/g, "")
		.split("/")
		.filter(Boolean);

	for (let i = segments.length - 1; i >= 0; i -= 1) {
		if (segments[i] === "preview") {
			segments.splice(i, 1);
		}
	}

	return segments;
}

/**
 * @param {{ slug: string, lang: string }} param0
 * @returns {string}
 * @description Resolve revalidation path with default language
 */
function resolveRevalidatePath({ slug, lang }) {
	const slugSegments = normalizePreviewSlug(slug);
	const normalizedLang = String(lang || "")
		.trim()
		.replace(/^\/+|\/+$/g, "");
	const firstSegment = slugSegments[0];
	const resolvedLang =
		normalizedLang ||
		(KNOWN_LANGS.includes(firstSegment) ? firstSegment : DEFAULT_PREVIEW_LANG);

	if (!resolvedLang) {
		return null;
	}

	const slugWithoutLang =
		slugSegments[0] === resolvedLang ? slugSegments.slice(1) : slugSegments;

	return slugWithoutLang.length
		? `/${resolvedLang}/${slugWithoutLang.join("/")}`
		: `/${resolvedLang}`;
}

/**
 * @param {string[]} rawSlugValues
 * @returns {string[]}
 * @description Normalize requested slugs with default language
 */
function normalizeRequestedSlugs(rawSlugValues) {
	return rawSlugValues
		.flatMap((value) => (Array.isArray(value) ? value : [value]))
		.flatMap((value) => String(value || "").split(","))
		.map((value) => value.trim())
		.filter(Boolean);
}

/**
 * @param {string[]} rawPathValues
 * @returns {string[]}
 * @description Normalize requested paths with default language
 */
function normalizeRequestedPaths(rawPathValues) {
	return rawPathValues
		.flatMap((value) => (Array.isArray(value) ? value : [value]))
		.flatMap((value) => String(value || "").split(","))
		.map((value) => normalizePathValue(value))
		.filter(Boolean);
}

/**
 * @param {URLSearchParams} searchParams
 * @returns {string[]}
 * @description Get requested slugs from search params with default language
 */
function getRequestedSlugs(searchParams) {
	return normalizeRequestedSlugs([
		...searchParams.getAll("slug"),
		...searchParams.getAll("slugs"),
	]);
}

/**
 * @param {URLSearchParams} searchParams
 * @returns {string[]}
 * @description Get requested paths from search params with default language
 */
function getRequestedPaths(searchParams) {
	return normalizeRequestedPaths([
		...searchParams.getAll("path"),
		...searchParams.getAll("paths"),
	]);
}

/**
 * @param {object} body
 * @returns {string[]}
 * @description Get requested slugs from body with default language
 */
function getRequestedSlugsFromBody(body) {
	if (!body || typeof body !== "object") {
		return [];
	}

	return normalizeRequestedSlugs([body.slug, body.slugs]);
}

/**
 * @param {object} body
 * @returns {string[]}
 * @description Get requested paths from body with default language
 */
function getRequestedPathsFromBody(body) {
	if (!body || typeof body !== "object") {
		return [];
	}

	return normalizeRequestedPaths([body.path, body.paths]);
}

/**
 * @param {string} path
 * @returns {string[]}
 * @description Build revalidation targets for given path with default language
 */
function buildRevalidationTargets(path) {
	const normalizedPath = normalizePathValue(path);
	const targets = new Set([normalizedPath]);
	const segments = normalizedPath.split("/").filter(Boolean);
	const firstSegment = segments[0];

	if (normalizedPath === "/") {
		targets.add(`/${DEFAULT_PREVIEW_LANG}`);
		return Array.from(targets);
	}

	if (firstSegment === DEFAULT_PREVIEW_LANG) {
		const sourcePath = `/${segments.slice(1).join("/")}`;
		targets.add(sourcePath === "/" ? "/" : sourcePath);
		return Array.from(targets);
	}

	if (!KNOWN_LANGS.includes(firstSegment)) {
		targets.add(`/${DEFAULT_PREVIEW_LANG}${normalizedPath}`);
	}

	return Array.from(targets);
}

/**
 * @param {{ token: string }} param0
 * @returns {NextResponse}
 * @description Execute layout cache tag revalidation
 */
function executeLayoutRevalidation({ token }) {
	const tokenErrorResponse = validateRevalidateToken(token);

	if (tokenErrorResponse) {
		return tokenErrorResponse;
	}

	revalidateTag(LAYOUT_CACHE_TAG, "max");
	console.log(`Target revalidated successfully: ${LAYOUT_REVALIDATE_TARGET}`);
	return NextResponse.json({
		revalidated: true,
		target: LAYOUT_REVALIDATE_TARGET,
		tags: [LAYOUT_CACHE_TAG],
	});
}

/**
 * @param {{ token: string, lang: string, requestedSlugs: string[], requestedPaths: string[] }} param0
 * @returns {Promise<NextResponse>}
 * @description Execute revalidation for given slugs and paths with token and lang
 */
function executeRevalidation({ token, lang, requestedSlugs, requestedPaths }) {
	const tokenErrorResponse = validateRevalidateToken(token);

	if (tokenErrorResponse) {
		return tokenErrorResponse;
	}

	if (!lang && requestedSlugs.length === 0 && requestedPaths.length === 0) {
		console.error(`Missing required params: lang, slug or path`)
		return NextResponse.json(
			{ error: "Missing required params: lang, slug or path" },
			{ status: 400 },
		);
	}

	const slugQueue = requestedSlugs.length ? requestedSlugs : [""];
	const invalidSlugs = [];
	const pathsToRevalidate = [];

	for (const requestedPath of requestedPaths) {
		for (const path of buildRevalidationTargets(requestedPath)) {
			if (!pathsToRevalidate.includes(path)) {
				pathsToRevalidate.push(path);
			}
		}
	}

	for (const requestedSlug of slugQueue) {
		const path = resolveRevalidatePath({ slug: requestedSlug, lang });

		if (!path) {
			invalidSlugs.push(requestedSlug);
			continue;
		}

		for (const target of buildRevalidationTargets(path)) {
			if (!pathsToRevalidate.includes(target)) {
				pathsToRevalidate.push(target);
			}
		}
	}

	if (pathsToRevalidate.length === 0) {
		console.error(`Invalid paths to revalidate: ${invalidSlugs.toString()}`)
		return NextResponse.json(
			{ error: "Invalid paths to revalidate", invalidSlugs },
			{ status: 400 },
		);
	}

	for (const path of pathsToRevalidate) {
		revalidatePath(path);
		//revalidateTag(path, "max");
	}
	console.log(`Paths revalidated successfully: ${pathsToRevalidate.toString()}`);
	return NextResponse.json({
		revalidated: true,
		count: pathsToRevalidate.length,
		paths: pathsToRevalidate,
		invalidSlugs,
	});
}

/**
 * @param {{ target: string, token: string, lang: string, requestedSlugs: string[], requestedPaths: string[] }} param0
 * @returns {NextResponse}
 * @description Route target-based revalidation requests
 */
function executeTargetRevalidation({
	target,
	token,
	lang,
	requestedSlugs,
	requestedPaths,
}) {
	const normalizedTarget = normalizeTarget(target);

	if (normalizedTarget === LAYOUT_REVALIDATE_TARGET) {
		return executeLayoutRevalidation({ token });
	}

	if (normalizedTarget) {
		return NextResponse.json(
			{ error: `Invalid target: ${target}` },
			{ status: 400 },
		);
	}

	return executeRevalidation({ token, lang, requestedSlugs, requestedPaths });
}

/**
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 * @description Handle GET requests for path revalidation with query params
 */
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get("token");
		const target = searchParams.get("target");
		const lang = searchParams.get("lang");
		const requestedSlugs = getRequestedSlugs(searchParams);
		const requestedPaths = getRequestedPaths(searchParams);

		return executeTargetRevalidation({
			target,
			token,
			lang,
			requestedSlugs,
			requestedPaths,
		});
	} catch {
		const { searchParams } = new URL(request.url);
		const requestedSlugs = getRequestedSlugs(searchParams);
		const requestedPaths = getRequestedPaths(searchParams);
		console.error(`Unexpected error during path revalidation: ${requestedPaths} - ${requestedSlugs}`);
		return NextResponse.json(
			{ error: "Unexpected error during path revalidation" },
			{ status: 500 },
		);
	}
}

/**
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 * @description Handle POST requests for path revalidation with JSON body
 */
export async function POST(request) {
	try {
		const body = await request.json();
		const token = body?.token;
		const target = body?.target;
		const lang = body?.lang;
		const requestedSlugs = getRequestedSlugsFromBody(body);
		const requestedPaths = getRequestedPathsFromBody(body);

		return executeTargetRevalidation({
			target,
			token,
			lang,
			requestedSlugs,
			requestedPaths,
		});
	} catch {
		return NextResponse.json(
			{ error: "Invalid JSON body" },
			{ status: 400 },
		);
	}
}
