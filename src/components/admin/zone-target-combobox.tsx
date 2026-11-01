"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Search, Globe, MapPin, Check, ChevronDown, X, Plus } from "lucide-react";
import {
  COUNTRIES,
  INTERNATIONAL_REGIONS,
  getCountryCode,
  type CountryItem,
  type CountryRegion,
} from "@/lib/countries";
import {
  searchIndonesianRegions,
  findProvinceByCity,
  type IndonesianRegion,
} from "@/lib/indonesia-regions";
import { cn } from "@/lib/utils";

/* =========================================================================
   ZoneCountryCombobox
   Compact searchable country dropdown for courier zone fields.
   ========================================================================= */

interface ZoneCountryComboboxProps {
  value: string;
  onChange: (country: string) => void;
  placeholder?: string;
  isEn?: boolean;
}

export function ZoneCountryCombobox({
  value,
  onChange,
  placeholder,
  isEn = false,
}: ZoneCountryComboboxProps) {
  const [input, setInput] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync when external value changes
  useEffect(() => {
    setInput(value || "");
  }, [value]);

  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameId.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [input]);

  // Click outside closes dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInput(value || "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const handleSelect = (c: CountryItem) => {
    setInput(c.name);
    setIsOpen(false);
    onChange(c.name);
  };

  const handleClear = () => {
    setInput("");
    onChange("");
    inputRef.current?.focus();
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
      setHighlightIndex((prev) => (prev + 1) % Math.max(1, suggestions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + suggestions.length) % Math.max(1, suggestions.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[highlightIndex]) handleSelect(suggestions[highlightIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setInput(value || "");
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || (isEn ? "Search country..." : "Cari negara...")}
          autoComplete="off"
          className="w-full h-8 rounded-md border border-latte bg-white pl-7 pr-14 text-xs text-espresso-800 placeholder:text-espresso-300 focus:outline-none focus:ring-1 focus:ring-caramel-500 font-medium"
        />
        <Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-caramel-600 pointer-events-none" />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {input && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 text-espresso-300 hover:bg-espresso-50 hover:text-espresso-600 transition"
              title={isEn ? "Clear" : "Hapus"}
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
            className="p-0.5 text-espresso-300 hover:text-espresso-600"
          >
            <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-espresso-100 bg-white p-0.5 shadow-lg">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-espresso-400 flex items-center justify-between">
            <span>{isEn ? "Countries" : "Daftar Negara"}</span>
            <span className="text-[9px] lowercase font-normal">
              {suggestions.length} {isEn ? "available" : "tersedia"}
            </span>
          </div>

          {suggestions.length === 0 ? (
            <div className="px-2 py-2.5 text-center text-[11px] text-espresso-400">
              {isEn
                ? `No country matching "${input}"`
                : `Tidak ada negara cocok dengan "${input}"`}
            </div>
          ) : (
            <ul role="listbox" className="space-y-0.5">
              {suggestions.map((c, idx) => {
                const isSelected = c.name.toLowerCase() === (value || "").toLowerCase();
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
                      "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[11px] transition",
                      isHighlighted
                        ? "bg-caramel-50 text-espresso-950 font-medium"
                        : "text-espresso-700 hover:bg-cream/70",
                      isSelected && "bg-caramel-100/60 font-semibold text-espresso-950"
                    )}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Globe className="h-3 w-3 flex-shrink-0 text-caramel-500" />
                      <span className="truncate">{displayName}</span>
                      {c.name !== c.nameId && (
                        <span className="text-[10px] text-espresso-400 truncate">
                          ({isEn ? c.nameId : c.name})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 pl-1">
                      <span className="rounded bg-cream px-1 py-0.5 text-[9px] font-mono font-bold text-espresso-600 border border-espresso-100">
                        {c.code}
                      </span>
                      {isSelected && <Check className="h-3 w-3 text-caramel-600" />}
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

/* =========================================================================
   ZoneCityCombobox
   Compact searchable city dropdown for courier zone fields.
   Shows Indonesian cities (default) or international cities based on
   countryContext. Auto-resolves province when a city is selected.
   ========================================================================= */

// Quick-access popular Indonesian cities
const POPULAR_CITIES_QUICK: IndonesianRegion[] = [
  { city: "Kota Bandung", province: "Jawa Barat" },
  { city: "Kota Tangerang", province: "Banten" },
  { city: "Jakarta Selatan", province: "DKI Jakarta" },
  { city: "Kota Bekasi", province: "Jawa Barat" },
  { city: "Kota Depok", province: "Jawa Barat" },
  { city: "Kota Surabaya", province: "Jawa Timur" },
  { city: "Kota Semarang", province: "Jawa Tengah" },
  { city: "Kota Yogyakarta", province: "D.I. Yogyakarta" },
  { city: "Kota Medan", province: "Sumatera Utara" },
  { city: "Kota Makassar", province: "Sulawesi Selatan" },
  { city: "Kota Denpasar", province: "Bali" },
  { city: "Kota Balikpapan", province: "Kalimantan Timur" },
  { city: "Kota Palembang", province: "Sumatera Selatan" },
  { city: "Kota Malang", province: "Jawa Timur" },
  { city: "Kota Bogor", province: "Jawa Barat" },
];

interface ZoneCityComboboxProps {
  /** Nilai kota yang saat ini terpilih */
  value: string;
  /** Callback saat kota dipilih: menerima (city, province) */
  onChange: (city: string, province: string) => void;
  /** Konteks negara untuk menampilkan kota yang sesuai (default: "Indonesia") */
  countryContext?: string;
  placeholder?: string;
  isEn?: boolean;
}

export function ZoneCityCombobox({
  value,
  onChange,
  countryContext = "Indonesia",
  placeholder,
  isEn = false,
}: ZoneCityComboboxProps) {
  const [input, setInput] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const countryCode = useMemo(() => getCountryCode(countryContext), [countryContext]);
  const isIndonesia = countryCode === "ID";

  // Sync when external value changes
  useEffect(() => {
    setInput(value || "");
  }, [value]);

  // Reset input when country context changes
  const prevCountryRef = useRef(countryContext);
  useEffect(() => {
    if (countryContext !== prevCountryRef.current) {
      prevCountryRef.current = countryContext;
      // Only reset if the current value doesn't exist in new context
      if (value) {
        const newCode = getCountryCode(countryContext);
        const isNewIndo = newCode === "ID";
        if (isNewIndo) {
          const prov = findProvinceByCity(value);
          if (!prov) {
            setInput("");
            onChange("", "");
          }
        } else {
          const intlList = INTERNATIONAL_REGIONS[newCode] || [];
          const exists = intlList.some((r) => r.city.toLowerCase() === value.toLowerCase());
          if (!exists) {
            setInput("");
            onChange("", "");
          }
        }
      }
    }
  }, [countryContext, value, onChange]);

  const suggestions = useMemo((): CountryRegion[] => {
    const q = input.trim().toLowerCase();
    if (isIndonesia) {
      if (!q) return POPULAR_CITIES_QUICK;
      return searchIndonesianRegions(input, 15);
    }
    const intlList = INTERNATIONAL_REGIONS[countryCode] || [];
    if (!q) return intlList;
    return intlList
      .filter(
        (r) =>
          r.city.toLowerCase().includes(q) ||
          r.province.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [input, isIndonesia, countryCode]);

  // Click outside closes dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInput(value || "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const handleSelect = (item: CountryRegion) => {
    setInput(item.city);
    setIsOpen(false);
    onChange(item.city, item.province);
  };

  const handleClear = () => {
    setInput("");
    onChange("", "");
    inputRef.current?.focus();
  };

  const handleSelectCustom = (customCity: string) => {
    const trimmed = customCity.trim();
    if (!trimmed) return;
    setInput(trimmed);
    setIsOpen(false);
    const resolvedProvince = isIndonesia ? (findProvinceByCity(trimmed) || "") : "";
    onChange(trimmed, resolvedProvince);
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
      setHighlightIndex((prev) => (prev + 1) % Math.max(1, suggestions.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + suggestions.length) % Math.max(1, suggestions.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[highlightIndex]) {
        handleSelect(suggestions[highlightIndex]);
      } else if (input.trim()) {
        handleSelectCustom(input);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setInput(value || "");
    }
  };

  const countryLabel = isIndonesia
    ? (isEn ? "Indonesia" : "Indonesia")
    : countryContext || (isEn ? "selected country" : "negara terpilih");

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setIsOpen(true);
            setHighlightIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            placeholder ||
            (isEn
              ? `Search city in ${countryLabel}...`
              : `Cari kota di ${countryLabel}...`)
          }
          autoComplete="off"
          className="w-full h-8 rounded-md border border-latte bg-white pl-7 pr-14 text-xs text-espresso-800 placeholder:text-espresso-300 focus:outline-none focus:ring-1 focus:ring-caramel-500 font-medium"
        />
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-espresso-400 pointer-events-none" />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {input && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-0.5 text-espresso-300 hover:bg-espresso-50 hover:text-espresso-600 transition"
              title={isEn ? "Clear" : "Hapus"}
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
            className="p-0.5 text-espresso-300 hover:text-espresso-600"
          >
            <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-espresso-100 bg-white p-0.5 shadow-lg min-w-56">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-espresso-400 flex items-center justify-between">
            <span>
              {isIndonesia
                ? (isEn ? "Cities in Indonesia" : "Kota di Indonesia")
                : (isEn ? `Cities in ${countryContext}` : `Kota di ${countryContext}`)}
            </span>
            <span className="text-[9px] lowercase font-normal">
              {suggestions.length} {isEn ? "available" : "tersedia"}
            </span>
          </div>

          {suggestions.length === 0 ? (
            <div className="p-1.5 space-y-1">
              <div className="px-2 py-1.5 text-center text-[11px] text-espresso-400">
                {isEn
                  ? `No city matching "${input}"`
                  : `Tidak ada kota cocok dengan "${input}"`}
              </div>
              {input.trim() && (
                <button
                  type="button"
                  onClick={() => handleSelectCustom(input)}
                  className="w-full flex items-center justify-between rounded-md bg-caramel-50 px-2 py-1.5 text-[11px] font-semibold text-caramel-900 hover:bg-caramel-100 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <Plus className="h-3 w-3 text-caramel-600" />
                    {isEn ? `Use "${input.trim()}"` : `Gunakan "${input.trim()}"`}
                  </span>
                  <Check className="h-3 w-3 text-caramel-700" />
                </button>
              )}
            </div>
          ) : (
            <ul role="listbox" className="space-y-0.5">
              {suggestions.map((item, idx) => {
                const isSelected = item.city.toLowerCase() === (value || "").toLowerCase();
                const isHighlighted = idx === highlightIndex;

                return (
                  <li
                    key={`${item.city}-${item.province}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[11px] transition",
                      isHighlighted
                        ? "bg-caramel-50 text-espresso-950 font-medium"
                        : "text-espresso-700 hover:bg-cream/70",
                      isSelected && "bg-caramel-100/60 font-semibold text-espresso-950"
                    )}
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <MapPin className="h-3 w-3 flex-shrink-0 text-caramel-500" />
                      <span className="truncate">{item.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 pl-1">
                      <span className="rounded bg-cream px-1 py-0.5 text-[9px] text-espresso-500 truncate max-w-24">
                        {item.province}
                      </span>
                      {isSelected && <Check className="h-3 w-3 text-caramel-600" />}
                    </div>
                  </li>
                );
              })}

              {/* Custom city option when typed value doesn't match any suggestion */}
              {input.trim() &&
                !suggestions.some(
                  (s) => s.city.toLowerCase() === input.trim().toLowerCase()
                ) && (
                  <li
                    role="option"
                    onClick={() => handleSelectCustom(input)}
                    className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-[11px] text-caramel-800 hover:bg-caramel-50 font-medium border-t border-espresso-100/60 mt-0.5 transition"
                  >
                    <span className="flex items-center gap-1">
                      <Plus className="h-3 w-3 text-caramel-600" />
                      {isEn ? `Use "${input.trim()}" (Custom)` : `Gunakan "${input.trim()}" (Kustom)`}
                    </span>
                    <Check className="h-3 w-3 text-caramel-600" />
                  </li>
                )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
