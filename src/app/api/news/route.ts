// src/app/api/news/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import * as xml2js from "xml2js";
import stringSimilarity from "string-similarity";
import { NewsItem } from "@/types";

async function fetchETMarketsNews(): Promise<NewsItem[]> {
  const res = await fetch("https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms");
  const xml = await res.text();
  const parsed = await xml2js.parseStringPromise(xml);
  const items = parsed.rss.channel[0].item || [];

  const news: NewsItem[] = items.slice(0, 10).map((item: any) => ({
    title: item.title[0],
    url: item.link[0],
    source: "ETMarkets",
    publishedAt: new Date(item.pubDate[0]).toISOString(),
  }));

  return news;
}

async function fetchMoneycontrolNews(): Promise<NewsItem[]> {
  const res = await fetch("https://www.moneycontrol.com/news/business/markets/");
  const html = await res.text();
  const $ = cheerio.load(html);
  const news: NewsItem[] = [];

  $("li.clearfix").each((_, el) => {
    const anchor = $(el).find("a");
    const title = anchor.text().trim();
    const href = anchor.attr("href") || "";
    const url = href.startsWith("http")
      ? href
      : `https://www.moneycontrol.com${href}`;
    const publishedAt = new Date().toISOString();

    if (title.length > 10 && url && !news.find(n => n.url === url)) {
      news.push({ title, url, source: "Moneycontrol", publishedAt });
    }
  });

  return news.slice(0, 10);
}

function deduplicateNews(news: NewsItem[]): NewsItem[] {
  const unique: NewsItem[] = [];

  for (const item of news) {
    const isExactDuplicate = unique.some(
      n => n.title.toLowerCase().trim() === item.title.toLowerCase().trim()
    );

    const isFuzzyDuplicate = unique.some(
      n => stringSimilarity.compareTwoStrings(n.title, item.title) > 0.8
    );

    if (!isExactDuplicate && !isFuzzyDuplicate) {
      unique.push(item);
    }
  }

  return unique;
}

export async function GET() {
  try {
    const [etmarkets, moneycontrol] = await Promise.all([
      fetchETMarketsNews(),
      fetchMoneycontrolNews(),
    ]);

    const combined = [...etmarkets, ...moneycontrol];
    const unique = deduplicateNews(combined).slice(0, 16);

    return NextResponse.json(unique);
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json({ error: "Scraping failed" }, { status: 500 });
  }
}
