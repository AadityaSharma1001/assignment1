import { SentimentAnalysis } from "@/types";

export async function analyzeNewsWithGemini(headline: string): Promise<SentimentAnalysis> {
  const res = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ headline }),
  });

  if (!res.ok) {
    throw new Error("Failed to get Gemini analysis");
  }

  return res.json();
}
