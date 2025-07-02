"use client";

import { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio";

export default function PortfolioSelector() {
  const [input, setInput] = useState("");
  const { stocks, addStock, removeStock } = usePortfolioStore();

  const handleAdd = () => {
    if (input.trim()) {
      addStock(input.trim());
      setInput("");
    }
  };

  return (
    <div className="w-full max-w-md p-4 bg-white dark:bg-zinc-900 shadow-md rounded-xl">
      <h2 className="text-xl font-semibold mb-2">🧾 Your Portfolio</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter stock symbol (e.g., RELIANCE)"
          className="flex-1 px-3 py-2 rounded-md border dark:bg-zinc-800 dark:border-zinc-700"
        />
        <button
          onClick={handleAdd}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Add
        </button>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {stocks.map((symbol) => (
          <li
            key={symbol}
            className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center gap-2"
          >
            {symbol}
            <button onClick={() => removeStock(symbol)} className="text-red-500 font-bold">
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
