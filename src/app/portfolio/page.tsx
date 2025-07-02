"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePortfolioStore } from "@/store/portfolio";
import {
  getUserStocks,
  addUserStock,
  removeUserStock,
  getStockQuote,
  getStockTimeSeries,
} from "@/lib/portfolio-api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import debounce from "lodash.debounce";
import Link from "next/link";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const { stocks, addStock, removeStock } = usePortfolioStore();

  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [quote, setQuote] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<"1M" | "3M" | "1Y">("1M");

  const fetchPortfolio = async () => {
    if (session?.user?.email) {
      const userStocks = await getUserStocks();
      userStocks.forEach((s: string) => addStock(s));
    }
  };

  const debouncedSearch = debounce(async (query: string) => {
    if (query.length < 2) return;
    try {
      const res = await fetch(`/api/stocks/search?q=${query}`);
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    debouncedSearch(val);
  };

  const handleAddStock = async () => {
    const symbol = input.trim().toUpperCase();
    if (!symbol || !session?.user?.email) return;

    const success = await addUserStock(symbol);
    if (success) {
      addStock(symbol);
      setInput("");
      setSearchResults([]);
    }
  };

  const handleSelectSuggestion = (symbol: string) => {
    setInput(symbol);
    setSearchResults([]);
  };

  const handleRemoveStock = async (symbol: string) => {
    if (!session?.user?.email) return;
    const success = await removeUserStock(symbol);
    if (success) {
      removeStock(symbol);
      if (selectedStock === symbol) {
        setSelectedStock(null);
        setQuote(null);
        setChartData(null);
      }
    }
  };

  const getStartDate = () => {
    const today = new Date();
    const date = new Date(today);
    if (range === "1M") date.setMonth(today.getMonth() - 1);
    else if (range === "3M") date.setMonth(today.getMonth() - 3);
    else if (range === "1Y") date.setFullYear(today.getFullYear() - 1);
    return date.toISOString().split("T")[0];
  };

  const fetchStockData = async (symbol: string) => {
    setLoading(true);
    try {
      const [q, t] = await Promise.all([
        getStockQuote(symbol),
        getStockTimeSeries(symbol, getStartDate()),
      ]);

      setQuote(q);

      const labels = Object.keys(t).reverse();
      const prices = Object.values(t)
        .map((entry: any) => {
          const close =
            entry["4. close"] ??
            entry.close ??
            entry.close_price ??
            entry.c ??
            null;
          return close ? parseFloat(close) : null;
        })
        .filter((val) => val !== null)
        .reverse();

      setChartData({
        labels,
        datasets: [
          {
            label: `${symbol} Closing Price`,
            data: prices,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      });
    } catch (err) {
      console.error("❌ Failed to fetch stock data:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") fetchPortfolio();
  }, [status]);

  useEffect(() => {
    if (selectedStock) fetchStockData(selectedStock);
  }, [selectedStock, range]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center max-w-md mx-4 border border-slate-700/50">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to Your Portfolio</h2>
          <p className="text-slate-400 mb-6">Please sign in to access your investment dashboard and manage your stocks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  Your Portfolio
                </h1>
                <p className="text-slate-400 text-lg">Manage and track your stock holdings and investments</p>
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
        </div>

        {/* Search Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-slate-700/50">
          <div className="relative">
            <div className="relative">
              <svg className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Search for stocks (e.g., RELIANCE, TCS, INFY)"
                className="w-full pl-14 pr-6 py-5 bg-slate-700/50 border-2 border-slate-600/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 text-lg placeholder-slate-400 text-white backdrop-blur-sm"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-slate-800/90 backdrop-blur-lg border-2 border-slate-600/50 rounded-2xl shadow-2xl z-10 max-h-60 overflow-y-auto">
                {searchResults.map((s, index) => (
                  <div
                    key={s.symbol}
                    className={`p-5 hover:bg-slate-700/50 cursor-pointer transition-colors duration-150 ${
                      stocks.includes(s.symbol)
                        ? "opacity-50 pointer-events-none bg-slate-700/30"
                        : ""
                    } ${index !== searchResults.length - 1 ? "border-b border-slate-700/50" : ""}`}
                    onClick={() => handleSelectSuggestion(s.symbol)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-white text-lg">{s.symbol}</span>
                        <p className="text-slate-400 text-sm mt-1">{s.name}</p>
                      </div>
                      {stocks.includes(s.symbol) && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium border border-green-500/30">
                          Added
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddStock}
            className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
          >
            Add to Portfolio
          </button>
        </div>

        {/* Portfolio Grid */}
        {stocks.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl p-16 text-center border border-slate-700/50">
            <div className="w-24 h-24 bg-slate-700/50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Your portfolio is empty</h3>
            <p className="text-slate-400">Start building your investment portfolio by adding your first stock above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {stocks.map((stock) => (
              <div
                key={stock}
                className={`group bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer border transform hover:-translate-y-2 ${
                  selectedStock === stock 
                    ? "border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-purple-600/10 shadow-blue-500/20" 
                    : "border-slate-700/50 hover:border-slate-600/50"
                }`}
                onClick={() => setSelectedStock(stock)}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg ${
                        selectedStock === stock 
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/30" 
                          : "bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200 group-hover:from-slate-500 group-hover:to-slate-600"
                      }`}>
                        {stock.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-white">{stock}</h3>
                        <p className="text-sm text-slate-400">Stock Symbol</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStock(stock);
                    }}
                    className="w-full mt-6 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-3 px-5 rounded-xl transition-all duration-200 font-medium border border-red-500/30 hover:border-red-400/50 backdrop-blur-sm"
                  >
                    Remove from Portfolio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-slate-700/50">
            <div className="flex items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-300 font-medium text-xl">Fetching stock data...</p>
            </div>
          </div>
        )}

        {/* Stock Details */}
        {selectedStock && !loading && quote && chartData && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold mb-3 text-white">{selectedStock}</h2>
                  {quote.shortName && (
                    <p className="text-blue-100 text-xl font-medium">{quote.shortName}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-white">
                    ₹{quote.regularMarketPrice ?? quote["05. price"] ?? "N/A"}
                  </div>
                  <p className="text-blue-100 text-sm mt-2">
                    {quote.regularMarketTime
                      ? `Updated ${new Date(quote.regularMarketTime).toLocaleString()}`
                      : quote["07. latest trading day"]
                      ? `Last updated: ${quote["07. latest trading day"]}`
                      : "Time unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="p-10">
              <div className="flex flex-wrap gap-4 mb-8">
                {["1M", "3M", "1Y"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r as "1M" | "3M" | "1Y")}
                    className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                      range === r
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50 backdrop-blur-sm"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {chartData.datasets[0].data.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-700/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-xl">No chart data available for this stock</p>
                </div>
              ) : (
                <div className="bg-slate-700/30 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/30">
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return `₹${context.parsed.y.toFixed(2)}`;
                            },
                          },
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          titleColor: 'white',
                          bodyColor: 'white',
                          borderColor: 'rgba(16, 185, 129, 1)',
                          borderWidth: 1,
                        },
                        legend: { display: false },
                      },
                      scales: {
                        x: {
                          title: { 
                            display: true, 
                            text: "Date", 
                            font: { size: 14, weight: 'bold' },
                            color: '#cbd5e1'
                          },
                          grid: {
                            color: 'rgba(71, 85, 105, 0.3)',
                          },
                          ticks: {
                            color: '#94a3b8',
                          }
                        },
                        y: {
                          title: {
                            display: true,
                            text: "Price (₹)",
                            font: { size: 14, weight: 'bold' },
                            color: '#cbd5e1'
                          },
                          grid: {
                            color: 'rgba(71, 85, 105, 0.3)',
                          },
                          ticks: {
                            color: '#94a3b8',
                          }
                        },
                      },
                    }}
                  />
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-slate-500">Data provided by Yahoo Finance</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}