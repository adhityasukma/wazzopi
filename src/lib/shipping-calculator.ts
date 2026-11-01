import type { ShippingMethod } from "./settings-types";

export type CartItemWeightLike = {
  name: string;
  variantName?: string | null;
  quantity: number;
};

export type CalculatedRate = {
  id: string;
  name: string;
  cost: number;
  baseRatePerKg: number;
  etd: string;
  isDynamic: boolean;
  enabled: boolean;
  zoneLabel: string;
};

/**
 * Menghitung estimasi berat keranjang berdasarkan nama produk & varian
 */
export function estimateCartWeight(items: CartItemWeightLike[]): {
  totalGrams: number;
  chargeableKg: number;
} {
  let totalGrams = 0;

  for (const item of items) {
    let itemGrams = 250; // Default 250 gram untuk kopi

    const textToMatch = `${item.name} ${item.variantName || ""}`.toLowerCase();

    if (textToMatch.includes("1000g") || textToMatch.includes("1000 g") || textToMatch.includes("1kg") || textToMatch.includes("1 kg")) {
      itemGrams = 1000;
    } else if (textToMatch.includes("500g") || textToMatch.includes("500 g")) {
      itemGrams = 500;
    } else if (textToMatch.includes("250g") || textToMatch.includes("250 g")) {
      itemGrams = 250;
    } else if (textToMatch.includes("200g") || textToMatch.includes("200 g")) {
      itemGrams = 200;
    } else if (textToMatch.includes("100g") || textToMatch.includes("100 g")) {
      itemGrams = 100;
    } else if (textToMatch.includes("mug") || textToMatch.includes("cangkir") || textToMatch.includes("tumbler")) {
      itemGrams = 400; // Merchandise
    } else if (textToMatch.includes("dripper") || textToMatch.includes("server") || textToMatch.includes("alat")) {
      itemGrams = 350; // Alat seduh
    }

    totalGrams += itemGrams * item.quantity;
  }

  // Aturan standar kurir: berat minimal 1 kg, pembulatan ke atas per kg
  const chargeableKg = Math.max(1, Math.ceil(totalGrams / 1000));

  return { totalGrams, chargeableKg };
}

export type ShippingZoneInfo = {
  zoneKey: string;
  label: string;
  labelEn: string;
  multiplier: number;
};

/**
 * Menentukan zona pengiriman dari Kota Asal ke Kota Tujuan
 */
export function getShippingZone(
  destinationCity: string,
  destinationProvince: string
): ShippingZoneInfo {
  const city = (destinationCity || "").toLowerCase().trim();
  const prov = (destinationProvince || "").toLowerCase().trim();

  // 1. Zona Lokal / Aglomerasi (Bandung & Cimahi)
  if (
    city.includes("bandung") ||
    city.includes("cimahi")
  ) {
    return {
      zoneKey: "LOCAL",
      label: "Lokal Bandung Raya & Cimahi",
      labelEn: "Local Bandung Area & Cimahi",
      multiplier: 1.0,
    };
  }

  // 2. Zona Jawa Barat & Jabodetabek & Banten
  if (
    prov.includes("jawa barat") ||
    prov.includes("jakarta") ||
    prov.includes("banten")
  ) {
    return {
      zoneKey: "JABAR_JABODETABEK",
      label: "Jawa Barat, Banten & Jabodetabek",
      labelEn: "West Java, Banten & Greater Jakarta",
      multiplier: 1.25,
    };
  }

  // 3. Jawa Tengah & D.I. Yogyakarta
  if (
    prov.includes("jawa tengah") ||
    prov.includes("yogyakarta")
  ) {
    return {
      zoneKey: "JATENG_DIY",
      label: "Jawa Tengah & D.I. Yogyakarta",
      labelEn: "Central Java & Yogyakarta",
      multiplier: 1.9,
    };
  }

  // 4. Jawa Timur
  if (prov.includes("jawa timur")) {
    return {
      zoneKey: "JATIM",
      label: "Jawa Timur",
      labelEn: "East Java",
      multiplier: 2.1,
    };
  }

  // 5. Bali & Nusa Tenggara Barat
  if (prov.includes("bali") || prov.includes("nusa tenggara barat")) {
    return {
      zoneKey: "BALI_NTB",
      label: "Bali & Nusa Tenggara Barat",
      labelEn: "Bali & West Nusa Tenggara",
      multiplier: 2.9,
    };
  }

  // 6. Sumatera Bagian Selatan & Lampung
  if (
    prov.includes("lampung") ||
    prov.includes("sumatera selatan") ||
    prov.includes("bengkulu") ||
    prov.includes("jambi") ||
    prov.includes("bangka")
  ) {
    return {
      zoneKey: "SUMATERA_SELATAN",
      label: "Sumatera Bagian Selatan",
      labelEn: "Southern Sumatra",
      multiplier: 2.4,
    };
  }

  // 7. Sumatera Bagian Tengah & Utara (Sumbar, Riau, Kepri, Sumut, Aceh)
  if (
    prov.includes("sumatera") ||
    prov.includes("riau") ||
    prov.includes("aceh")
  ) {
    return {
      zoneKey: "SUMATERA_UTARA",
      label: "Sumatera Bagian Tengah & Utara",
      labelEn: "Central & Northern Sumatra",
      multiplier: 3.8,
    };
  }

  // 8. Kalimantan
  if (prov.includes("kalimantan")) {
    return {
      zoneKey: "KALIMANTAN",
      label: "Pulau Kalimantan",
      labelEn: "Kalimantan (Borneo)",
      multiplier: 4.0,
    };
  }

  // 9. Sulawesi & Gorontalo
  if (prov.includes("sulawesi") || prov.includes("gorontalo")) {
    return {
      zoneKey: "SULAWESI",
      label: "Pulau Sulawesi",
      labelEn: "Sulawesi (Celebes)",
      multiplier: 4.2,
    };
  }

  // 10. NTT, Maluku, dan Papua
  if (
    prov.includes("nusa tenggara timur") ||
    prov.includes("maluku") ||
    prov.includes("papua")
  ) {
    return {
      zoneKey: "EAST_INDONESIA",
      label: "Indonesia Bagian Timur",
      labelEn: "Eastern Indonesia",
      multiplier: 7.5,
    };
  }

  // Default Fallback
  return {
    zoneKey: "DEFAULT",
    label: "Antar Kota Domestik",
    labelEn: "Intercity Domestic",
    multiplier: 2.0,
  };
}

export type ShippingCalculationOptions = {
  destinationCountry?: string;
  originCity?: string;
  locale?: "en" | "id";
};

/**
 * Memeriksa apakah suatu metode kurir melayani negara tujuan
 */
export function isCourierEligibleForCountry(
  m: ShippingMethod,
  destinationCountry?: string
): boolean {
  const normCountry = (destinationCountry || "Indonesia").toLowerCase().trim();
  const isDomestic =
    normCountry === "indonesia" ||
    normCountry === "id" ||
    normCountry === "" ||
    normCountry === "indonesian";

  const scope = m.countryScope || "DOMESTIC";

  if (scope === "ALL") return true;
  if (scope === "DOMESTIC") return isDomestic;
  if (scope === "INTERNATIONAL") return !isDomestic;
  if (scope === "SPECIFIC") {
    if (!m.targetCountry || !m.targetCountry.trim()) return true;
    const target = m.targetCountry.toLowerCase().trim();
    return normCountry.includes(target) || target.includes(normCountry);
  }
  return true;
}

/**
 * Memeriksa apakah suatu metode kurir melayani kota / provinsi tujuan
 */
export function isCourierEligibleForCity(
  m: ShippingMethod,
  destinationCity?: string,
  destinationProvince?: string,
  originCity?: string
): boolean {
  const scope = m.cityScope || "ALL";
  if (scope === "ALL") return true;

  const normCity = (destinationCity || "").toLowerCase().trim();
  const normProv = (destinationProvince || "").toLowerCase().trim();
  const normOrigin = (originCity || "Bandung").toLowerCase().trim();

  // Jika kota belum dipilih sama sekali di form checkout, jangan langsung tolak agar tetap terlihat
  if (!normCity) return true;

  if (scope === "SAME_CITY") {
    // Jika kota asal Bandung, mencakup Bandung Raya & Cimahi
    if (normOrigin.includes("bandung") || !normOrigin) {
      return normCity.includes("bandung") || normCity.includes("cimahi");
    }
    return normCity.includes(normOrigin) || normOrigin.includes(normCity);
  }

  if (scope === "SPECIFIC") {
    let matches = true;
    if (m.targetCity && m.targetCity.trim()) {
      const targetCity = m.targetCity.toLowerCase().trim();
      matches = matches && (normCity.includes(targetCity) || targetCity.includes(normCity));
    }
    if (m.targetProvince && m.targetProvince.trim()) {
      const targetProv = m.targetProvince.toLowerCase().trim();
      matches = matches && (normProv.includes(targetProv) || targetProv.includes(normProv));
    }
    return matches;
  }

  return true;
}

/**
 * Menghitung tarif kurir dinamis berdasarkan negara, kota tujuan, dan berat belanjaan
 */
export function calculateDynamicRates(
  methods: ShippingMethod[],
  destinationCity: string,
  destinationProvince: string,
  items: CartItemWeightLike[],
  options?: ShippingCalculationOptions
): CalculatedRate[] {
  const destCountry = options?.destinationCountry || "Indonesia";
  const originCity = options?.originCity || "";
  const isEn = (options?.locale || "id") === "en";
  const normCountry = destCountry.toLowerCase().trim();
  const isDomestic =
    normCountry === "indonesia" ||
    normCountry === "id" ||
    normCountry === "" ||
    normCountry === "indonesian";

  // Filter metode kurir berdasarkan cakupan negara & kota/provinsi tujuan
  const eligibleMethods = (methods || []).filter((m) => {
    const countryOk = isCourierEligibleForCountry(m, destCountry);
    const cityOk = isCourierEligibleForCity(m, destinationCity, destinationProvince, originCity);
    return countryOk && cityOk;
  });

  const { chargeableKg } = estimateCartWeight(items);

  // Jika pengiriman internasional (ke luar Indonesia)
  if (!isDomestic) {
    return eligibleMethods.map((m) => {
      const baseRate = m.cost > 0 ? m.cost : 350000;
      const totalCost = baseRate * chargeableKg;
      return {
        id: m.id,
        name: m.name,
        cost: totalCost,
        baseRatePerKg: baseRate,
        etd: m.etd || (isEn ? "3-7 business days" : "3-7 hari kerja"),
        isDynamic: true,
        enabled: m.enabled,
        zoneLabel: isEn ? `International (${destCountry})` : `Internasional (${destCountry})`,
      };
    });
  }

  // Jika pengiriman domestik tetapi kota belum dipilih sama sekali, gunakan tarif default admin
  if (!destinationCity || !destinationCity.trim()) {
    return eligibleMethods.map((m) => ({
      id: m.id,
      name: m.name,
      cost: m.cost,
      baseRatePerKg: m.cost,
      etd: m.etd,
      isDynamic: false,
      enabled: m.enabled,
      zoneLabel: isEn ? "Standard Rate" : "Tarif Standar",
    }));
  }

  const zone = getShippingZone(destinationCity, destinationProvince);

  return eligibleMethods.map((m) => {
    const idLower = m.id.toLowerCase();
    const nameLower = m.name.toLowerCase();

    let baseRate = 9000; // Tarif dasar lokal per kg
    let etd = m.etd;

    // Deteksi jenis kurir
    if (idLower.includes("jne") || nameLower.includes("jne")) {
      switch (zone.zoneKey) {
        case "LOCAL":
          baseRate = 9000;
          etd = isEn ? "1-2 days" : "1-2 hari";
          break;
        case "JABAR_JABODETABEK":
          baseRate = 11000;
          etd = isEn ? "1-2 days" : "1-2 hari";
          break;
        case "JATENG_DIY":
          baseRate = 18000;
          etd = isEn ? "2-3 days" : "2-3 hari";
          break;
        case "JATIM":
          baseRate = 20000;
          etd = isEn ? "2-3 days" : "2-3 hari";
          break;
        case "SUMATERA_SELATAN":
          baseRate = 22000;
          etd = isEn ? "2-4 days" : "2-4 hari";
          break;
        case "BALI_NTB":
          baseRate = 28000;
          etd = isEn ? "2-4 days" : "2-4 hari";
          break;
        case "SUMATERA_UTARA":
          baseRate = 35000;
          etd = isEn ? "3-5 days" : "3-5 hari";
          break;
        case "KALIMANTAN":
          baseRate = 38000;
          etd = isEn ? "3-5 days" : "3-5 hari";
          break;
        case "SULAWESI":
          baseRate = 40000;
          etd = isEn ? "3-5 days" : "3-5 hari";
          break;
        case "EAST_INDONESIA":
          baseRate = 75000;
          etd = isEn ? "4-7 days" : "4-7 hari";
          break;
        default:
          baseRate = 18000;
          etd = isEn ? "2-3 days" : "2-3 hari";
      }
    } else if (idLower.includes("jnt") || nameLower.includes("j&t") || nameLower.includes("jnt")) {
      switch (zone.zoneKey) {
        case "LOCAL":
          baseRate = 9000;
          etd = isEn ? "1-2 days" : "1-2 hari";
          break;
        case "JABAR_JABODETABEK":
          baseRate = 11000;
          etd = isEn ? "1-2 days" : "1-2 hari";
          break;
        case "JATENG_DIY":
          baseRate = 17000;
          etd = isEn ? "2-3 days" : "2-3 hari";
          break;
        case "JATIM":
          baseRate = 19000;
          etd = isEn ? "2-3 days" : "2-3 hari";
          break;
        case "SUMATERA_SELATAN":
          baseRate = 21000;
          etd = isEn ? "2-4 days" : "2-4 hari";
          break;
        case "BALI_NTB":
          baseRate = 27000;
          etd = isEn ? "2-4 days" : "2-4 hari";
          break;
        case "SUMATERA_UTARA":
          baseRate = 34000;
          etd = isEn ? "3-5 days" : "3-5 hari";
          break;
        case "KALIMANTAN":
          baseRate = 37000;
          etd = isEn ? "3-5 days" : "3-5 hari";
          break;
        case "SULAWESI":
          baseRate = 39000;
          etd = isEn ? "3-5 days" : "3-5 hari";
          break;
        case "EAST_INDONESIA":
          baseRate = 72000;
          etd = isEn ? "4-7 days" : "4-7 hari";
          break;
        default:
          baseRate = 17000;
          etd = isEn ? "2-3 days" : "2-3 hari";
      }
    } else if (idLower.includes("sicepat") || nameLower.includes("sicepat")) {
      switch (zone.zoneKey) {
        case "LOCAL":
          baseRate = 10000;
          etd = isEn ? "1 day" : "1 hari";
          break;
        case "JABAR_JABODETABEK":
          baseRate = 14000;
          etd = isEn ? "1-2 days" : "1-2 hari";
          break;
        case "JATENG_DIY":
          baseRate = 24000;
          etd = isEn ? "1-2 days" : "1-2 hari";
          break;
        case "JATIM":
          baseRate = 26000;
          etd = isEn ? "1-2 days" : "1-2 hari";
          break;
        case "SUMATERA_SELATAN":
          baseRate = 27000;
          etd = isEn ? "2-3 days" : "2-3 hari";
          break;
        case "BALI_NTB":
          baseRate = 32000;
          etd = isEn ? "2-3 days" : "2-3 hari";
          break;
        case "SUMATERA_UTARA":
          baseRate = 40000;
          etd = isEn ? "2-4 days" : "2-4 hari";
          break;
        case "KALIMANTAN":
          baseRate = 42000;
          etd = isEn ? "2-4 days" : "2-4 hari";
          break;
        case "SULAWESI":
          baseRate = 45000;
          etd = isEn ? "2-4 days" : "2-4 hari";
          break;
        case "EAST_INDONESIA":
          baseRate = 85000;
          etd = isEn ? "3-6 days" : "3-6 hari";
          break;
        default:
          baseRate = 25000;
          etd = isEn ? "1-2 days" : "1-2 hari";
      }
    } else if (idLower.includes("gosend") || nameLower.includes("gosend") || nameLower.includes("instant")) {
      // GoSend hanya bisa di area lokal (Bandung & Cimahi)
      const isLocal = zone.zoneKey === "LOCAL";
      return {
        id: m.id,
        name: m.name,
        cost: isLocal ? 25000 : 0,
        baseRatePerKg: 25000,
        etd: isLocal
          ? (isEn ? "Same day (Instant)" : "Hari yang sama (Instant)")
          : (isEn ? "Bandung/Cimahi Area Only" : "Hanya Area Bandung/Cimahi"),
        isDynamic: true,
        enabled: m.enabled && isLocal,
        zoneLabel: isLocal
          ? (isEn ? "Reachable Area" : "Area Terjangkau")
          : (isEn ? "Out of Instant Range" : "Luar Jangkauan Instant"),
      };
    } else {
      // Kurir kustom lainnya
      baseRate = Math.round(m.cost * (zone.multiplier / 1.5));
    }

    const totalCost = baseRate * chargeableKg;

    return {
      id: m.id,
      name: m.name,
      cost: totalCost,
      baseRatePerKg: baseRate,
      etd,
      isDynamic: true,
      enabled: m.enabled,
      zoneLabel: isEn ? zone.labelEn : zone.label,
    };
  });
}
