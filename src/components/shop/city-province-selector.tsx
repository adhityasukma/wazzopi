"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Check, Lock, ChevronDown, X } from "lucide-react";
import {
  searchIndonesianRegions,
  findProvinceByCity,
  INDONESIAN_REGIONS,
  type IndonesianRegion,
} from "@/lib/indonesia-regions";
import { cn } from "@/lib/utils";

interface CityProvinceSelectorProps {
  defaultCity?: string | null;
  defaultProvince?: string | null;
  required?: boolean;
}

// Rekomendasi kota populer saat input pertama kali difokuskan
const POPULAR_CITIES: IndonesianRegion[] = [
  { city: "Jakarta Selatan", province: "DKI Jakarta" },
  { city: "Kota Bandung", province: "Jawa Barat" },
  { city: "Kota Surabaya", province: "Jawa Timur" },
  { city: "Kota Semarang", province: "Jawa Tengah" },
  { city: "Kota Yogyakarta", province: "D.I. Yogyakarta" },
  { city: "Kab. Sleman", province: "D.I. Yogyakarta" },
  { city: "Kota Medan", province: "Sumatera Utara" },
  { city: "Kota Makassar", province: "Sulawesi Selatan" },
  { city: "Kota Denpasar", province: "Bali" },
];

export function CityProvinceSelector({
  defaultCity = "",
  defaultProvince = "",
  required = true,
}: CityProvinceSelectorProps) {
  const [cityInput, setCityInput] = useState(defaultCity || "");
  const [selectedCity, setSelectedCity] = useState(defaultCity || "");
  const [selectedProvince, setSelectedProvince] = useState(defaultProvince || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Jika initial city ada tapi provinsi belum ada, deteksi provinsinya otomatis
  useEffect(() => {
    if (defaultCity && !selectedProvince) {
      const autoProv = findProvinceByCity(defaultCity);
      if (autoProv) {
        setSelectedProvince(autoProv);
      }
    }
  }, [defaultCity, selectedProvince]);

  // Filter daftar kota
  const suggestions = useMemo(() => {
    if (!cityInput.trim()) {
      return POPULAR_CITIES;
    }
    return searchIndonesianRegions(cityInput, 15);
  }, [cityInput]);

  // Klik di luar menutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Jika belum memilih kota valid dari list tapi sudah mengetik,
        // coba cocokkan dengan database wilayah
        if (cityInput.trim() && cityInput !== selectedCity) {
          const matched = findProvinceByCity(cityInput);
          if (matched) {
            setSelectedCity(cityInput.trim());
            setSelectedProvince(matched);
          }
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cityInput, selectedCity]);

  const handleSelect = (item: IndonesianRegion) => {
    setCityInput(item.city);
    setSelectedCity(item.city);
    setSelectedProvince(item.province);
    setIsOpen(false);
  };

  const handleClear = () => {
    setCityInput("");
    setSelectedCity("");
    setSelectedProvince("");
    setIsOpen(true);
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
      if (suggestions[highlightIndex]) {
        handleSelect(suggestions[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 1. Field Pilihan Kota / Kabupaten */}
      <div className="relative" ref={containerRef}>
        <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-espresso-800">
          <span>
            Kota / Kabupaten {required && <span className="text-rose-500">*</span>}
          </span>
          <span className="text-xs font-normal text-espresso-400">
            Ketik untuk mencari
          </span>
        </label>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={cityInput}
            onChange={(e) => {
              setCityInput(e.target.value);
              setIsOpen(true);
              setHighlightIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Cari Kota/Kabupaten (cth: Bandung, Sleman)..."
            autoComplete="off"
            className="w-full h-10 rounded-lg border border-espresso-100 bg-white pl-9 pr-16 text-sm text-espresso-900 placeholder:text-espresso-300 transition-colors focus:border-caramel-400 focus:outline-none focus:ring-2 focus:ring-caramel-100"
          />

          {/* Ikon Pencarian */}
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-300 pointer-events-none" />

          {/* Tombol Clear & Chevron */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {cityInput && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full p-1 text-espresso-300 hover:bg-espresso-50 hover:text-espresso-600 transition"
                title="Hapus pilihan"
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

        {/* Input Tersembunyi untuk Form Submit */}
        <input type="hidden" name="city" value={selectedCity || cityInput} required={required} />

        {/* Dropdown Hasil Pencarian */}
        {isOpen && (
          <div className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-lg border border-espresso-100 bg-white p-1 shadow-lg">
            {!cityInput.trim() && (
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-espresso-400">
                Kota Populer di Indonesia
              </div>
            )}

            {suggestions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-espresso-400">
                Kota &quot;{cityInput}&quot; tidak ditemukan dalam daftar resmi.
              </div>
            ) : (
              <ul ref={listRef} role="listbox" className="space-y-0.5">
                {suggestions.map((item, idx) => {
                  const isSelected =
                    selectedCity.toLowerCase() === item.city.toLowerCase();
                  const isHighlighted = idx === highlightIndex;

                  return (
                    <li
                      key={`${item.city}-${item.province}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setHighlightIndex(idx)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-xs transition",
                        isHighlighted
                          ? "bg-caramel-50 text-espresso-950 font-medium"
                          : "text-espresso-700 hover:bg-cream/70",
                        isSelected && "bg-caramel-100/60 font-semibold text-espresso-950"
                      )}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-caramel-500" />
                        <span className="truncate">{item.city}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                        <span className="rounded bg-cream px-1.5 py-0.5 text-[10px] text-espresso-500">
                          {item.province}
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

      {/* 2. Field Provinsi (Otomatis Terisi & Sinkron) */}
      <div>
        <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-espresso-800">
          <span>
            Provinsi {required && <span className="text-rose-500">*</span>}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-600">
            <Lock className="h-3 w-3" />
            Otomatis terisi
          </span>
        </label>

        <div className="relative">
          <input
            type="text"
            readOnly
            value={selectedProvince}
            placeholder="Terisi otomatis saat memilih Kota"
            className="w-full h-10 rounded-lg border border-espresso-100 bg-cream/50 px-3 text-sm font-medium text-espresso-800 placeholder:text-espresso-300 focus:outline-none cursor-default"
          />
          {selectedProvince && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs text-emerald-600 font-medium">
              <Check className="mr-1 h-3.5 w-3.5" />
              Tersinkron
            </div>
          )}
        </div>

        {/* Input Tersembunyi untuk Form Submit */}
        <input type="hidden" name="province" value={selectedProvince} required={required} />
      </div>
    </div>
  );
}
