"use client";

import Image from "next/image";
import NewsFeed from "./components/NewsFeed";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePortfolioStore } from "../store/portfolio";
import { getUserStocks } from "@/lib/portfolio-api";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const { addStock } = usePortfolioStore();

  useEffect(() => {
    const fetchAndSync = async () => {
      if (session?.user?.email) {
        try {
          const userStocks = await getUserStocks();
          userStocks.forEach((s: string) => addStock(s));
        } catch (err) {
          console.error("Failed to sync portfolio:", err);
        }
      }
    };

    if (status === "authenticated") {
      fetchAndSync();
    }
  }, [session, status, addStock]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156,146,172,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      <div className="relative z-10 grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-6 sm:p-10 gap-12 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-10 row-start-2 w-full max-w-6xl">
          {/* Enhanced Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/30">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Smart News + Portfolio Insights
                </h1>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400 max-w-md">
                Live curated news from Indian stock markets powered by AI
                intelligence
              </p>
            </div>

            <div className="mt-6 sm:mt-0">
              <Image
                className="dark:invert opacity-60 hover:opacity-100 transition-opacity duration-300"
                src="/next.svg"
                alt="Next.js logo"
                width={120}
                height={30}
                priority
              />
            </div>
          </div>

          {/* Enhanced Auth Section */}
          <div className="flex justify-center w-full">
            {session?.user ? (
              <div className="flex flex-col sm:flex-row justify-between w-full items-center gap-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/30 dark:border-gray-700/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">👋</span>
                  </div>
                  <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">
                    Welcome back,{" "}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {session.user.name?.split(" ")[0]}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
                >
                  <span className="relative z-10">Sign Out</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-white/30 dark:border-gray-700/30 text-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Get Started with Personalized News
                </h3>
                <button
                  onClick={() => signIn("google")}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* General News Card - Always visible */}
            <Link
              href="/"
              className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl p-6 text-center hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <span className="text-3xl">📰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  General News
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Latest market headlines and insights from top financial
                  sources
                </p>
              </div>
            </Link>

            {session?.user && (
              <>
                <Link
                  href="/filtered"
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl p-6 text-center hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <span className="text-3xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Filtered News
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Personalized news filtered by your portfolio holdings
                    </p>
                  </div>
                </Link>

                <Link
                  href="/portfolio"
                  className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 rounded-2xl p-6 text-center hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <span className="text-3xl">📂</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Your Portfolio
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      Manage and track your stock holdings and investments
                    </p>
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Enhanced News Feed Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📈</span>
                </div>
                Live Market Headlines
              </h2>
              <p className="text-blue-100 mt-2">
                Stay updated with the latest market movements and financial news
              </p>
            </div>
            <div className="p-6">
              <NewsFeed />
            </div>
          </div>
        </main>

        {/* Enhanced Footer */}
        <footer className="row-start-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl px-8 py-4 shadow-lg border border-white/30 dark:border-gray-700/30">
          <div className="flex gap-8 flex-wrap items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-2 font-medium">
              Built with <span className="text-red-500">❤️</span> using Next.js
            </span>
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium"
            >
              Learn More
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
