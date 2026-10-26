"use client";

import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from "react";
import { DEFAULT_CURRENCY, formatCurrency, type CurrencySettings } from "@/lib/currency";

const CurrencyContext = createContext<CurrencySettings>(DEFAULT_CURRENCY);

export function CurrencyProvider({ value, children }: { value: CurrencySettings; children: ReactNode }) {
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useMoney() {
  const cfg = useContext(CurrencyContext);
  return useCallback((v: number) => formatCurrency(v, cfg), [cfg]);
}

export function useCurrencyConfig() {
  return useContext(CurrencyContext);
}

/** true setelah hydrate di client (untuk state dari localStorage) */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
