import { NextRequest } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let symbol = searchParams.get("symbol");

  if (!symbol) {
    return new Response("Symbol required", { status: 400 });
  }

  // Add `.NS` if it's an Indian stock and no suffix provided
  if (!symbol.includes(".")) {
    symbol = `${symbol}.NS`;
  }

  try {
    const quote = await yahooFinance.quote(symbol);
    return Response.json(quote);
  } catch (error) {
    console.error("❌ Yahoo Finance quote fetch failed:", error);
    return new Response("Failed to fetch quote", { status: 500 });
  }
}
