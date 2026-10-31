"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, Coins, Check, ChevronDown, X } from "lucide-react";
import { CURRENCIES, type CurrencyItem } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";

interface CurrencyComboboxProps {
  value: string;
  onChange: (currency: CurrencyItem) => void;
  name?: string;
}

export function CurrencyCombobox({
  value,
  onChange,
  name = "code",
}: CurrencyComboboxProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const selectedItem = useMemo(
    () => CURRENCIES.find((c) => c.code === value) || CURRENCIES[0],
    [value]
  );

  const formatDisplay = (c: CurrencyItem) => {
    const label = isEn ? c.name : c.nameId;
    return `${label} (${c.code} - ${c.symbol})`;
  };

  const [query, setQuery] = useState(formatDisplay(selectedItem));
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sinkronisasi teks input jika value prop berubah dari luar
  useEffect(() => {
    setQuery(formatDisplay(selectedItem));
  }, [selectedItem, isEn]);

  // Filter daftar mata uang berdasarkan query pencarian
  const filteredCurrencies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURRENCIES;

    return CURRENCIES.filter((c) => {
      const matchCode = c.code.toLowerCase().includes(q);
      const matchSymbol = c.symbol.toLowerCase().includes(q);
      const matchName = c.name.toLowerCase().includes(q);
      const matchNameId = c.nameId.toLowerCase().includes(q);
      return matchCode || matchSymbol || matchName || matchNameId;
    });
  }, [query]);

  // Click outside menutup dropdown dan mengembalikan format teks ke item yang aktif
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery(formatDisplay(selectedItem));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedItem, isEn]);

  const handleSelect = (item: CurrencyItem) => {
    setQuery(formatDisplay(item));
    setIsOpen(false);
    onChange(item);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % Math.max(1, filteredCurrencies.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + filteredCurrencies.length) % Math.max(1, filteredCurrencies.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCurrencies[highlightIndex]) {
        handleSelect(filteredCurrencies[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery(formatDisplay(selectedItem));
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            isEn
              ? "Search currency (e.g. USD, IDR, Euro, Yen, $)..."
              : "Cari mata uang (cth: IDR, USD, Euro, Yen, Rp)..."
          }
          autoComplete="off"
          className="w-full h-10 rounded-lg border border-espresso-200 bg-white pl-9 pr-16 text-sm font-semibold text-espresso-900 placeholder:text-espresso-300 placeholder:font-normal transition focus:border-caramel-500 focus:outline-none focus:ring-2 focus:ring-caramel-100 shadow-2xs"
        />

        {/* Ikon Kiri */}
        <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-caramel-600 pointer-events-none" />

        {/* Tombol Clear & Dropdown Chevron */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-espresso-300 hover:bg-espresso-50 hover:text-espresso-600 transition"
              title={isEn ? "Clear search" : "Hapus pencarian"}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
            className="p-1 text-espresso-300 hover:text-espresso-600"
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </div>
      </div>

      {/* Hidden input untuk pengiriman form */}
      <input type="hidden" name={name} value={selectedItem.code} />

      {/* Dropdown Menu Hasil Pencarian */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 max-h-64 w-full overflow-auto rounded-lg border border-espresso-100 bg-white p-1 shadow-lg">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-espresso-400 flex items-center justify-between">
            <span>{isEn ? "Available Currencies" : "Daftar Mata Uang"}</span>
            <span className="text-[10px] lowercase font-normal text-espresso-400">
              {filteredCurrencies.length} {isEn ? "currencies found" : "mata uang ditemukan"}
            </span>
          </div>

          {filteredCurrencies.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-espresso-400">
              {isEn
                ? `No currency matching "${query}".`
                : `Tidak ada mata uang yang cocok dengan "${query}".`}
            </div>
          ) : (
            <ul ref={listRef} role="listbox" className="space-y-0.5">
              {filteredCurrencies.map((c, idx) => {
                const isSelected = c.code === selectedItem.code;
                const isHighlighted = idx === highlightIndex;
                const displayName = isEn ? c.name : c.nameId;

                return (
                  <li
                    key={c.code}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(c)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-xs transition",
                      isHighlighted
                        ? "bg-caramel-50 text-espresso-950 font-medium"
                        : "text-espresso-700 hover:bg-cream/70",
                      isSelected && "bg-caramel-100/60 font-semibold text-espresso-950"
                    )}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="inline-flex h-6 min-w-6 items-center justify-center rounded bg-latte/60 px-1.5 font-mono text-xs font-bold text-caramel-900 border border-espresso-100">
                        {c.symbol}
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-espresso-900">{displayName}</span>
                        {c.name !== c.nameId && (
                          <span className="ml-1.5 text-[11px] text-espresso-400">
                            ({isEn ? c.nameId : c.name})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                      <span className="rounded bg-cream px-1.5 py-0.5 text-[10px] font-mono text-espresso-700 font-bold border border-espresso-100">
                        {c.code}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-caramel-600" />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
