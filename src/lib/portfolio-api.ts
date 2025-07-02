
export async function getUserStocks(): Promise<string[]> {
  const res = await fetch("/api/portfolio", { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  return res.json();
}

export async function addUserStock(symbol: string): Promise<string[]> {
  const res = await fetch("/api/portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        symbol: symbol
    }),
  });
  if (!res.ok) throw new Error("Failed to add stock");
  return res.json();
}

export async function removeUserStock(symbol: string): Promise<string[]> {
  const res = await fetch("/api/portfolio", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol }),
  });
  if (!res.ok) throw new Error("Failed to remove stock");
  return res.json();
}

export async function getStockQuote(symbol: string): Promise<any> {
  const res = await fetch(`/api/stocks/quote?symbol=${symbol}`);
  if (!res.ok) throw new Error("Failed to fetch quote");
  return res.json();
}

export async function getStockTimeSeries(symbol: string, startDate?: string): Promise<any> {
  const res = await fetch(`/api/stocks/timeseries?symbol=${symbol}&start=${startDate}`);
  if (!res.ok) throw new Error("Failed to fetch time-series");
  return res.json();
}
