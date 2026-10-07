import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const MIN_QUERY_LENGTH = 3;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

let airportsCache = null;

const normalizeText = (value) =>
	String(value ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim();

const toPositiveInt = (value, fallback) => {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const loadAirports = async () => {
	if (airportsCache) {
		return airportsCache;
	}

	const filePath = join(process.cwd(), "src", "data", "airports.json");
	const content = await readFile(filePath, "utf8");
	const parsed = JSON.parse(content);

	airportsCache = Array.isArray(parsed) ? parsed : [];
	return airportsCache;
};

const scoreAirport = (airport, normalizedQuery) => {
	const city = normalizeText(airport.city);
	const airportName = normalizeText(airport.airportName);
	const airportCode = normalizeText(airport.airportCode);
	const bookingCodeMX = normalizeText(airport.bookingCodeMX);

	if (airportCode === normalizedQuery || bookingCodeMX === normalizedQuery) {
		return 100;
	}

	if (
		airportCode.startsWith(normalizedQuery) ||
		bookingCodeMX.startsWith(normalizedQuery)
	) {
		return 95;
	}

	if (city.startsWith(normalizedQuery)) {
		return 90;
	}

	if (airportName.startsWith(normalizedQuery)) {
		return 80;
	}

	if (city.includes(normalizedQuery)) {
		return 70;
	}

	if (airportName.includes(normalizedQuery)) {
		return 60;
	}

	return 0;
};

const mapAirport = (airport, market) => {
	const isMxMarket = market === "mx";
	const value =
		isMxMarket && airport.bookingCodeMX
			? airport.bookingCodeMX
			: airport.airportCode;

	return {
		value,
		code: airport.airportCode,
		label: airport.city || airport.airportName || airport.airportCode,
		subtitle: airport.airportName || "",
		airportCode: airport.airportCode,
		airportName: airport.airportName,
		city: airport.city,
		countryCode: airport.countryCode,
		bookingCodeMX: airport.bookingCodeMX,
	};
};

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q") ?? "";
		const market = normalizeText(searchParams.get("market")) === "mx" ? "mx" : "international";
		const normalizedQuery = normalizeText(query);
		const limit = Math.min(
			MAX_LIMIT,
			toPositiveInt(searchParams.get("limit"), DEFAULT_LIMIT),
		);

		if (normalizedQuery.length < MIN_QUERY_LENGTH) {
			return NextResponse.json(
				{
					items: [],
					minQueryLength: MIN_QUERY_LENGTH,
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
					},
				},
			);
		}

		const airports = await loadAirports();

		const items = airports
			.filter((airport) => {
				if (!airport || typeof airport !== "object") {
					return false;
				}
				/*
				if (market === "mx" && !airport.bookingCodeMX) {
					return false;
				}
				*/
				return scoreAirport(airport, normalizedQuery) > 0;
			})
			.map((airport) => ({
				score: scoreAirport(airport, normalizedQuery),
				airport,
			}))
			.sort((a, b) => {
				if (b.score !== a.score) {
					return b.score - a.score;
				}

				return normalizeText(a.airport.city).localeCompare(
					normalizeText(b.airport.city),
				);
			})
			.slice(0, limit)
			.map(({ airport }) => mapAirport(airport, market));

		return NextResponse.json(
			{
				items,
				minQueryLength: MIN_QUERY_LENGTH,
			},
			{
				status: 200,
				headers: {
					"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
				},
			},
		);
	} catch {
		return NextResponse.json(
			{
				error: "Unexpected error fetching airports",
			},
			{ status: 500 },
		);
	}
}
