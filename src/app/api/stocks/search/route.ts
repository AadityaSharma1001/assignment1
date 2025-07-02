// src/app/api/stocks/search/route.ts

/* eslint-disable @typescript-eslint/no-explicit-any */


import { NextRequest } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) return new Response("Query required", { status: 400 });

  try {
    const result = await yahooFinance.search(query);

    // Bypass type errors by forcing each item to 'any'
    const matches = (result.quotes as any[]).filter(
      (q) =>
        typeof q.symbol === "string" &&
        (q.symbol.endsWith(".NS") || q.symbol.endsWith(".BSE"))
    );

    const formatted = matches.map((q) => ({
      symbol: q.symbol,
      name: q.shortname ?? q.name ?? "Unknown",
      exchange: q.exchange,
    }));

    return Response.json(formatted);
  } catch (err) {
    console.error("Yahoo Finance search failed:", err);
    return new Response("Search failed", { status: 500 });
  }
}
