"use client";

import { useEffect, useState } from "react";
import { NewsItem } from "../../types/index";

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch news from API
  const fetchNews = async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data);
    } catch (err) {
      console.error("Failed to fetch news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-10">
        Loading news...
      </div>
    );
  }

  return (
    <section className="p-4">
      <h2 className="text-xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
        📰 Latest Market News
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {news.map((item, index) => (
          <a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl shadow-sm hover:shadow-md transition p-4"
          >
            <h3 className="font-medium text-lg text-zinc-900 dark:text-zinc-100 mb-2">
              {item.title}
            </h3>
            <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                {item.source}
              </span>
              <span>{new Date(item.publishedAt).toLocaleString()}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
