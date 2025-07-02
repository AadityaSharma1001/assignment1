// src/app/api/stocks/timeseries/route.ts

import yahooFinance from "yahoo-finance2";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let symbol = searchParams.get("symbol");
  const start = searchParams.get("start");
  console.log("Fetching historical data for:", symbol, "from:", start);

  if (!symbol) {
    return new Response("Symbol required", { status: 400 });
  }

  if (!symbol.includes(".")) {
    symbol = `${symbol}.NS`;
  }

  // ✅ Safe fallback for start date
  const safeStart: string = start ?? new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .split("T")[0]; // fallback = 1M ago

  try {
    const result = await yahooFinance.historical(symbol, {
      period1: safeStart,
      interval: "1d",
    });

    if (!result || result.length === 0) {
      return new Response("No historical data found", { status: 404 });
    }

    // Convert array to object with date keys
    const formatted: Record<string, any> = {};
    result.forEach((entry) => {
      const date = new Date(entry.date).toISOString().split("T")[0];
      formatted[date] = entry;
    });

    return Response.json(formatted);
  } catch (error) {
    console.error("❌ Yahoo Finance historical fetch failed:", error);
    return new Response("Failed to fetch historical data", { status: 500 });
  }
}
