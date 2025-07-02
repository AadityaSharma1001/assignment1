export type StockPrice = {
  symbol: string;
  price: number;
  change: number;
  changePercent?: number;
  vlastUpdated?: string;
};
export type NewsItem = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
};

export type StockHolding = {
  symbol: string;
  quantity?: number;
};

export type SentimentAnalysis = {
  impact: "Positive" | "Neutral" | "Negative";
  confidence: string;
  reason: string;
};

export type MentionChartData = {
  stock: string;
  mentions: number;
};
