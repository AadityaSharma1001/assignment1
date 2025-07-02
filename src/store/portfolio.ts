import { create } from "zustand";

type PortfolioState = {
  stocks: string[];
  addStock: (symbol: string) => void;
  removeStock: (symbol: string) => void;
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  stocks: [],
  addStock: (symbol) =>
    set((state) => ({
      stocks: Array.from(new Set([...state.stocks, symbol.toUpperCase()])),
    })),
  removeStock: (symbol) =>
    set((state) => ({
      stocks: state.stocks.filter((s) => s !== symbol.toUpperCase()),
    })),
}));
