// src/app/api/gemini/route.ts
import { NextRequest } from "next/server";
import { SentimentAnalysis } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(req: NextRequest) {
  const { headline } = await req.json();

  console.log("🔍 Analyzing headline:", headline);

  if (!headline || typeof headline !== "string") {
    return new Response(JSON.stringify({ error: "Missing or invalid headline" }), {
      status: 400,
    });
  }

  const prompt = `
You are an AI that analyzes a single Stock market news headline.

ONLY respond with a valid JSON object. Do NOT include any introduction, explanation, or markdown.

Respond strictly in the following format (and only this):

{
  "impact": "Positive" | "Neutral" | "Negative",
  "confidence": "High" | "Medium" | "Low",
  "reason": "One short sentence explaining your reasoning"
}

Headline: "${headline}"
`.trim();

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await geminiRes.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleaned = content.replace(/```json|```/g, "").trim();
    console.log("📜 Gemini response:", cleaned);

    try {
      const result: SentimentAnalysis = JSON.parse(cleaned);
      if (
        result &&
        typeof result.impact === "string" &&
        typeof result.confidence === "string" &&
        typeof result.reason === "string"
      ) {
        return new Response(JSON.stringify(result), { status: 200 });
      }
    } catch {}

    return new Response(
      JSON.stringify({
        impact: "Neutral",
        confidence: "Low",
        reason: "Unable to parse Gemini response correctly.",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Gemini API call failed:", err);
    return new Response(JSON.stringify({ error: "Gemini API error" }), {
      status: 500,
    });
  }
}
