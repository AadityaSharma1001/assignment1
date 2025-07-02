"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/store/portfolio";
import { NewsItem, SentimentAnalysis } from "@/types";
import { analyzeNewsWithGemini } from "@/lib/gemini";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function FilteredNewsPage() {
  const { data: session } = useSession();
  const { stocks } = usePortfolioStore();
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [insights, setInsights] = useState<Record<string, SentimentAnalysis>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  const fetchFilteredNews = async () => {
    try {
      const res = await fetch("/api/news");
      const allNews: NewsItem[] = await res.json();
      const stockKeywords = stocks.map((s) => s.split(".")[0].toLowerCase());

      const filtered = allNews.filter((item) =>
        stockKeywords.some((keyword) =>
          item.title.toLowerCase().includes(keyword)
        )
      );

      setFilteredNews(filtered);

      const insightResults: Record<string, SentimentAnalysis> = {};

      for (const item of filtered) {
        const result = await analyzeNewsWithGemini(item.title);
        insightResults[item.url] = result;
      }

      setInsights(insightResults);
    } catch (err) {
      console.error("Error fetching or analyzing news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && stocks.length > 0) {
      fetchFilteredNews();
    }
  }, [session, stocks]);

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156,146,172,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
          <div className="text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/30 dark:border-gray-700/30 max-w-md">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication Required
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Please sign in to view filtered news based on your portfolio.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156,146,172,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-10">
        {/* Header Section */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/30 dark:border-gray-700/30 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🧠</span>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  AI-Powered Filtered News
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Personalized news insights based on your portfolio holdings
                </p>
              </div>
            </div>
            
            <Link
              href="/"
              className="group inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Portfolio Summary */}
          {stocks.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 mb-2">
                Tracking Portfolio ({stocks.length} stocks)
              </h3>
              <div className="flex flex-wrap gap-2">
                {stocks.slice(0, 5).map((stock, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium"
                  >
                    {stock.split(".")[0]}
                  </span>
                ))}
                {stocks.length > 5 && (
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
                    +{stocks.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/30 dark:border-gray-700/30 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Analyzing Your Portfolio News
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  AI is processing news articles and generating insights...
                </p>
              </div>
              <div className="flex space-x-1 mt-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/30 dark:border-gray-700/30 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📰</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No News Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              No relevant news articles found for your selected stocks. Try adding more stocks to your portfolio or check back later.
            </p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <span className="text-lg">📂</span>
              Manage Portfolio
            </Link>
          </div>
        ) : (
          <div>
            {/* Results Summary */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30 dark:border-gray-700/30 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-xl">✨</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Found {filteredNews.length} Relevant Articles
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      AI-analyzed insights for your portfolio
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {filteredNews.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    articles
                  </div>
                </div>
              </div>
            </div>

            {/* News Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {filteredNews.map((item, index) => (
                <div
                  key={index}
                  className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-3">
                        {item.title}
                      </h3>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          {item.source}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(item.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </a>

                    {/* AI Insights */}
                    {insights[item.url] ? (
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-900/20 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-xs">🤖</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            AI Analysis
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Market Impact
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                insights[item.url].impact === "Positive"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : insights[item.url].impact === "Negative"
                                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {insights[item.url].impact}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Confidence
                            </span>
                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {insights[item.url].confidence}
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                              Analysis
                            </span>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {insights[item.url].reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            AI is analyzing this article...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}