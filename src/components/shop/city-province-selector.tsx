"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Check, Lock, ChevronDown, X, Globe } from "lucide-react";
import {
  searchIndonesianRegions,
  findProvinceByCity,
  findPostalCodeByCity,
  type IndonesianRegion,
} from "@/lib/indonesia-regions";
import {
  COUNTRIES,
  INTERNATIONAL_REGIONS,
  getCountryCode,
  type CountryRegion,
} from "@/lib/countries";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";

interface CityProvinceSelectorProps {
  country?: string | null;
  defaultCountry?: string | null;
  showCountry?: boolean;
  defaultCity?: string | null;
  defaultProvince?: string | null;
  defaultPostalCode?: string | null;
  required?: boolean;
  showPostalCode?: boolean;
  postalCodeRequired?: boolean;
  onChange?: (data: { city: string; province: string; postalCode?: string; country?: string }) => void;
  onPostalCodeChange?: (postalCode: string) => void;
  onCountryChange?: (country: string) => void;
}

// Rekomendasi kota populer Indonesia saat input pertama kali difokuskan
const POPULAR_INDONESIAN_CITIES: IndonesianRegion[] = [
  { city: "Jakarta Selatan", province: "DKI Jakarta" },
  { city: "Kota Tangerang", province: "Banten" },
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
  country,
  defaultCountry = "Indonesia",
  showCountry = false,
  defaultCity = "",
  defaultProvince = "",
  defaultPostalCode = "",
  required = true,
  showPostalCode = false,
  postalCodeRequired = false,
  onChange,
  onPostalCodeChange,
  onCountryChange,
}: CityProvinceSelectorProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  const [selectedCountry, setSelectedCountry] = useState(country || defaultCountry || "Indonesia");
  const countryCode = useMemo(() => getCountryCode(selectedCountry), [selectedCountry]);
  const isIndonesia = countryCode === "ID";

  const [cityInput, setCityInput] = useState(defaultCity || "");
  const [selectedCity, setSelectedCity] = useState(defaultCity || "");
  const [selectedProvince, setSelectedProvince] = useState(() => {
    if (defaultProvince) return defaultProvince;
    if (defaultCity && isIndonesia) return findProvinceByCity(defaultCity) || "";
    return "";
  });
  const [postalCode, setPostalCode] = useState(() => {
    if (defaultPostalCode) return defaultPostalCode;
    if (defaultCity && isIndonesia) {
      const prov = defaultProvince || findProvinceByCity(defaultCity) || undefined;
      return findPostalCodeByCity(defaultCity, prov) || "";
    }
    return "";
  });

  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sinkronisasi negara jika prop berubah
  useEffect(() => {
    if (country && country !== selectedCountry) {
      setSelectedCountry(country);
    }
  }, [country, selectedCountry]);

  // Sinkronisasi kota jika prop defaultCity berubah
  const prevDefaultCityRef = useRef(defaultCity);
  useEffect(() => {
    if (defaultCity !== prevDefaultCityRef.current) {
      prevDefaultCityRef.current = defaultCity;
      setCityInput(defaultCity || "");
      setSelectedCity(defaultCity || "");
      const prov = defaultProvince || (defaultCity && isIndonesia ? findProvinceByCity(defaultCity) || "" : "");
      setSelectedProvince(prov);
      const post = defaultPostalCode || (defaultCity && isIndonesia ? findPostalCodeByCity(defaultCity, prov) || "" : "");
      setPostalCode(post);
    }
  }, [defaultCity, defaultProvince, defaultPostalCode, isIndonesia]);

  // Daftar saran wilayah disesuaikan dengan negara aktif
  const suggestions = useMemo((): CountryRegion[] => {
    const q = cityInput.trim().toLowerCase();

    if (isIndonesia) {
      if (!q) {
        return POPULAR_INDONESIAN_CITIES;
      }
      return searchIndonesianRegions(cityInput, 15);
    }

    const intlList = INTERNATIONAL_REGIONS[countryCode] || [];
    if (!q) {
      return intlList.slice(0, 12);
    }
    return intlList
      .filter(
        (r) =>
          r.city.toLowerCase().includes(q) ||
          r.province.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [cityInput, isIndonesia, countryCode]);

  // Handler pergantian negara (Country Change)
  const handleCountryChange = (newCountry: string) => {
    setSelectedCountry(newCountry);
    // Reset data kota, provinsi, dan kode pos saat negara berganti
    setCityInput("");
    setSelectedCity("");
    setSelectedProvince("");
    setPostalCode("");
    setIsOpen(false);
    onCountryChange?.(newCountry);
    onPostalCodeChange?.("");
    onChange?.({ city: "", province: "", postalCode: "", country: newCountry });
  };

  // Klik di luar menutup dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (!cityInput.trim()) {
          setSelectedCity("");
          setSelectedProvince("");
          setPostalCode("");
          onPostalCodeChange?.("");
          onChange?.({ city: "", province: "", postalCode: "", country: selectedCountry });
        } else if (cityInput.trim() && cityInput !== selectedCity) {
          if (isIndonesia) {
            const matched = findProvinceByCity(cityInput);
            if (matched) {
              setSelectedCity(cityInput.trim());
              setSelectedProvince(matched);
              const autoPostal = findPostalCodeByCity(cityInput.trim(), matched) || "";
              if (autoPostal && !postalCode) {
                setPostalCode(autoPostal);
                onPostalCodeChange?.(autoPostal);
              }
              onChange?.({ city: cityInput.trim(), province: matched, postalCode: autoPostal || postalCode, country: selectedCountry });
            } else {
              setCityInput("");
              setSelectedCity("");
              setSelectedProvince("");
              setPostalCode("");
              onPostalCodeChange?.("");
              onChange?.({ city: "", province: "", postalCode: "", country: selectedCountry });
            }
          } else {
            // Internasional: simpan nilai yang diketik
            setSelectedCity(cityInput.trim());
            onChange?.({ city: cityInput.trim(), province: selectedProvince, postalCode, country: selectedCountry });
          }
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cityInput, selectedCity, selectedProvince, postalCode, selectedCountry, isIndonesia, onChange, onPostalCodeChange]);

  const handleSelect = (item: CountryRegion) => {
    setCityInput(item.city);
    setSelectedCity(item.city);
    setSelectedProvince(item.province);

    const autoPostal = item.postalCode || (isIndonesia ? findPostalCodeByCity(item.city, item.province) || "" : "");
    if (autoPostal) {
      setPostalCode(autoPostal);
      onPostalCodeChange?.(autoPostal);
    }

    setIsOpen(false);
    onChange?.({
      city: item.city,
      province: item.province,
      postalCode: autoPostal || postalCode,
      country: selectedCountry,
    });
  };

  const handleClear = () => {
    setCityInput("");
    setSelectedCity("");
    setSelectedProvince("");
    setPostalCode("");
    setIsOpen(false);
    inputRef.current?.focus();
    onPostalCodeChange?.("");
    onChange?.({ city: "", province: "", postalCode: "", country: selectedCountry });
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
    <div className="space-y-4">
      {/* 0. Field Country (Pilihan Negara ala WooCommerce - diletakkan sebelum Kota / Kabupaten) */}
      {showCountry && (
        <div>
          <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-espresso-700">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-caramel-600" />
              {isEn ? "Country / Region" : "Negara / Wilayah"} {required && <span className="text-rose-500">*</span>}
            </span>
            <span className="text-[11px] font-normal text-espresso-400">
              {isEn ? "Adapts available cities and provinces" : "Menyesuaikan daftar kota & provinsi"}
            </span>
          </label>
          <div className="relative">
            <select
              name="country"
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full h-10 rounded-lg border border-espresso-200 bg-white px-3 text-sm font-semibold text-espresso-900 focus:border-caramel-500 focus:outline-none focus:ring-2 focus:ring-caramel-100 transition shadow-2xs"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {isEn ? c.name : c.nameId} ({c.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Jika showCountry false, pastikan input hidden country tetap terkirim */}
      {!showCountry && country && (
        <input type="hidden" name="country" value={country} />
      )}

      {/* Grid: Kota, Provinsi, Kode Pos */}
      <div
        className={cn(
          "grid grid-cols-1 gap-4",
          showPostalCode ? "sm:grid-cols-12" : "sm:grid-cols-2"
        )}
      >
        {/* 1. Field Pilihan Kota / Kabupaten */}
        <div
          className={cn("relative", showPostalCode ? "sm:col-span-5" : "sm:col-span-1")}
          ref={containerRef}
        >
          <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-espresso-700">
            <span>
              {isEn ? "City / Regency" : "Kota / Kabupaten"} {required && <span className="text-rose-500">*</span>}
            </span>
            <span className="text-[11px] font-normal text-espresso-400">
              {isEn ? "Type to search" : "Ketik untuk mencari"}
            </span>
          </label>

          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={cityInput}
              onChange={(e) => {
                const val = e.target.value;
                setCityInput(val);
                setIsOpen(true);
                setHighlightIndex(0);

                if (!val.trim()) {
                  setSelectedCity("");
                  setSelectedProvince("");
                  setPostalCode("");
                  onPostalCodeChange?.("");
                  onChange?.({ city: "", province: "", postalCode: "", country: selectedCountry });
                } else if (selectedCity && val.trim().toLowerCase() !== selectedCity.toLowerCase()) {
                  setSelectedCity("");
                  if (isIndonesia) setSelectedProvince("");
                  onChange?.({ city: "", province: isIndonesia ? "" : selectedProvince, postalCode, country: selectedCountry });
                }
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={
                isIndonesia
                  ? (isEn ? "Search city (e.g. Tangerang, Bandung)..." : "Cari kota (cth: Tangerang, Bandung)...")
                  : (isEn ? `Search city in ${selectedCountry}...` : `Cari kota di ${selectedCountry}...`)
              }
              autoComplete="off"
              className="w-full h-10 rounded-lg border border-espresso-200 bg-white pl-9 pr-16 text-sm text-espresso-900 placeholder:text-espresso-300 transition focus:border-caramel-500 focus:outline-none focus:ring-2 focus:ring-caramel-100 shadow-2xs"
            />

            {/* Ikon Pencarian */}
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-espresso-400 pointer-events-none" />

            {/* Tombol Clear & Chevron */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {cityInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-full p-1 text-espresso-300 hover:bg-espresso-50 hover:text-espresso-600 transition"
                  title={isEn ? "Clear selection" : "Hapus pilihan"}
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
                  {isIndonesia
                    ? (isEn ? "Popular Cities in Indonesia" : "Kota Populer di Indonesia")
                    : (isEn ? `Major Cities in ${selectedCountry}` : `Kota Utama di ${selectedCountry}`)}
                </div>
              )}

              {suggestions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-espresso-400">
                  {isEn
                    ? `No pre-indexed city for "${cityInput}". You can continue with this input.`
                    : `Kota "${cityInput}" tidak ada di daftar indeks. Anda dapat melanjutkan dengan teks ini.`}
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

        {/* 2. Field Provinsi / State (Otomatis Terisi & Terkunci jika Indonesia, atau Editable jika Luar Negeri) */}
        <div className={cn(showPostalCode ? "sm:col-span-4" : "sm:col-span-1")}>
          <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-espresso-700">
            <span>
              {isEn ? "Province / State" : "Provinsi / Wilayah"} {required && <span className="text-rose-500">*</span>}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-normal text-emerald-600">
              <Lock className="h-3 w-3" />
              {isEn ? "Auto-filled" : "Otomatis terisi"}
            </span>
          </label>

          <div className="relative">
            <input
              type="text"
              name="province"
              readOnly={isIndonesia}
              value={selectedProvince}
              onChange={(e) => {
                if (!isIndonesia) {
                  setSelectedProvince(e.target.value);
                  onChange?.({ city: selectedCity, province: e.target.value, postalCode, country: selectedCountry });
                }
              }}
              placeholder={
                isEn
                  ? (isIndonesia ? "Auto-filled when City is selected" : "Province or State name")
                  : (isIndonesia ? "Terisi otomatis saat memilih Kota" : "Nama provinsi atau negara bagian")
              }
              className={cn(
                "w-full h-10 rounded-lg border border-espresso-200 px-3 text-sm font-medium text-espresso-800 placeholder:text-espresso-300 focus:outline-none shadow-2xs",
                isIndonesia
                  ? "bg-cream/50 cursor-default"
                  : "bg-white focus:border-caramel-500 focus:ring-2 focus:ring-caramel-100"
              )}
            />
            {selectedProvince && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs text-emerald-600 font-medium pointer-events-none">
                <Check className="mr-1 h-3.5 w-3.5" />
                {isEn ? "Synced" : "Tersinkron"}
              </div>
            )}
          </div>
        </div>

        {/* 3. Field Kode Pos (Opsional Terintegrasi: Otomatis Terisi & Bisa Diedit) */}
        {showPostalCode && (
          <div className="sm:col-span-3">
            <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-espresso-700">
              <span>
                {isEn ? "Postal Code" : "Kode Pos"} {postalCodeRequired && <span className="text-rose-500">*</span>}
              </span>
              <span className="text-[11px] font-normal text-espresso-400">
                {isEn ? "Editable" : "Dapat diedit"}
              </span>
            </label>

            <div className="relative">
              <input
                type="text"
                name="postalCode"
                value={postalCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setPostalCode(val);
                  onPostalCodeChange?.(val);
                  onChange?.({
                    city: selectedCity,
                    province: selectedProvince,
                    postalCode: val,
                    country: selectedCountry,
                  });
                }}
                placeholder={isEn ? "E.g. 15111" : "Contoh: 15111"}
                required={postalCodeRequired}
                maxLength={10}
                className="w-full h-10 rounded-lg border border-espresso-200 bg-white px-3 text-sm text-espresso-900 placeholder:text-espresso-300 transition focus:border-caramel-500 focus:outline-none focus:ring-2 focus:ring-caramel-100 shadow-2xs"
              />
              {postalCode && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs text-emerald-600 font-medium pointer-events-none">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
