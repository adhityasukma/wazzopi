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
  multiplier: number;
};

/**
 * Menentukan zona pengiriman dari Kota Asal (Bandung) ke Kota Tujuan
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
      multiplier: 1.9,
    };
  }

  // 4. Jawa Timur
  if (prov.includes("jawa timur")) {
    return {
      zoneKey: "JATIM",
      label: "Jawa Timur",
      multiplier: 2.1,
    };
  }

  // 5. Bali & Nusa Tenggara Barat
  if (prov.includes("bali") || prov.includes("nusa tenggara barat")) {
    return {
      zoneKey: "BALI_NTB",
      label: "Bali & Nusa Tenggara Barat",
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
      multiplier: 3.8,
    };
  }

  // 8. Kalimantan
  if (prov.includes("kalimantan")) {
    return {
      zoneKey: "KALIMANTAN",
      label: "Pulau Kalimantan",
      multiplier: 4.0,
    };
  }

  // 9. Sulawesi & Gorontalo
  if (prov.includes("sulawesi") || prov.includes("gorontalo")) {
    return {
      zoneKey: "SULAWESI",
      label: "Pulau Sulawesi",
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
      multiplier: 7.5,
    };
  }

  // Default Fallback
  return {
    zoneKey: "DEFAULT",
    label: "Antar Kota Domestik",
    multiplier: 2.0,
  };
}

/**
 * Menghitung tarif kurir dinamis berdasarkan kota tujuan dan berat belanjaan
 */
export function calculateDynamicRates(
  methods: ShippingMethod[],
  destinationCity: string,
  destinationProvince: string,
  items: CartItemWeightLike[]
): CalculatedRate[] {
  // Jika kota belum dipilih sama sekali, gunakan tarif default admin
  if (!destinationCity || !destinationCity.trim()) {
    return methods.map((m) => ({
      id: m.id,
      name: m.name,
      cost: m.cost,
      baseRatePerKg: m.cost,
      etd: m.etd,
      isDynamic: false,
      enabled: m.enabled,
      zoneLabel: "Tarif Standar",
    }));
  }

  const { chargeableKg } = estimateCartWeight(items);
  const zone = getShippingZone(destinationCity, destinationProvince);

  return methods.map((m) => {
    const idLower = m.id.toLowerCase();
    const nameLower = m.name.toLowerCase();

    let baseRate = 9000; // Tarif dasar lokal per kg
    let etd = m.etd;

    // Deteksi jenis kurir
    if (idLower.includes("jne") || nameLower.includes("jne")) {
      switch (zone.zoneKey) {
        case "LOCAL":
          baseRate = 9000;
          etd = "1-2 hari";
          break;
        case "JABAR_JABODETABEK":
          baseRate = 11000;
          etd = "1-2 hari";
          break;
        case "JATENG_DIY":
          baseRate = 18000;
          etd = "2-3 hari";
          break;
        case "JATIM":
          baseRate = 20000;
          etd = "2-3 hari";
          break;
        case "SUMATERA_SELATAN":
          baseRate = 22000;
          etd = "2-4 hari";
          break;
        case "BALI_NTB":
          baseRate = 28000;
          etd = "2-4 hari";
          break;
        case "SUMATERA_UTARA":
          baseRate = 35000;
          etd = "3-5 hari";
          break;
        case "KALIMANTAN":
          baseRate = 38000;
          etd = "3-5 hari";
          break;
        case "SULAWESI":
          baseRate = 40000;
          etd = "3-5 hari";
          break;
        case "EAST_INDONESIA":
          baseRate = 75000;
          etd = "4-7 hari";
          break;
        default:
          baseRate = 18000;
          etd = "2-3 hari";
      }
    } else if (idLower.includes("jnt") || nameLower.includes("j&t") || nameLower.includes("jnt")) {
      switch (zone.zoneKey) {
        case "LOCAL":
          baseRate = 9000;
          etd = "1-2 hari";
          break;
        case "JABAR_JABODETABEK":
          baseRate = 11000;
          etd = "1-2 hari";
          break;
        case "JATENG_DIY":
          baseRate = 17000;
          etd = "2-3 hari";
          break;
        case "JATIM":
          baseRate = 19000;
          etd = "2-3 hari";
          break;
        case "SUMATERA_SELATAN":
          baseRate = 21000;
          etd = "2-4 hari";
          break;
        case "BALI_NTB":
          baseRate = 27000;
          etd = "2-4 hari";
          break;
        case "SUMATERA_UTARA":
          baseRate = 34000;
          etd = "3-5 hari";
          break;
        case "KALIMANTAN":
          baseRate = 37000;
          etd = "3-5 hari";
          break;
        case "SULAWESI":
          baseRate = 39000;
          etd = "3-5 hari";
          break;
        case "EAST_INDONESIA":
          baseRate = 72000;
          etd = "4-7 hari";
          break;
        default:
          baseRate = 17000;
          etd = "2-3 hari";
      }
    } else if (idLower.includes("sicepat") || nameLower.includes("sicepat")) {
      switch (zone.zoneKey) {
        case "LOCAL":
          baseRate = 10000;
          etd = "1 hari";
          break;
        case "JABAR_JABODETABEK":
          baseRate = 14000;
          etd = "1-2 hari";
          break;
        case "JATENG_DIY":
          baseRate = 24000;
          etd = "1-2 hari";
          break;
        case "JATIM":
          baseRate = 26000;
          etd = "1-2 hari";
          break;
        case "SUMATERA_SELATAN":
          baseRate = 27000;
          etd = "2-3 hari";
          break;
        case "BALI_NTB":
          baseRate = 32000;
          etd = "2-3 hari";
          break;
        case "SUMATERA_UTARA":
          baseRate = 40000;
          etd = "2-4 hari";
          break;
        case "KALIMANTAN":
          baseRate = 42000;
          etd = "2-4 hari";
          break;
        case "SULAWESI":
          baseRate = 45000;
          etd = "2-4 hari";
          break;
        case "EAST_INDONESIA":
          baseRate = 85000;
          etd = "3-6 hari";
          break;
        default:
          baseRate = 25000;
          etd = "1-2 hari";
      }
    } else if (idLower.includes("gosend") || nameLower.includes("gosend") || nameLower.includes("instant")) {
      // GoSend hanya bisa di area lokal (Bandung & Cimahi)
      const isLocal = zone.zoneKey === "LOCAL";
      return {
        id: m.id,
        name: m.name,
        cost: isLocal ? 25000 : 0,
        baseRatePerKg: 25000,
        etd: isLocal ? "Hari yang sama (Instant)" : "Hanya Area Bandung/Cimahi",
        isDynamic: true,
        enabled: m.enabled && isLocal,
        zoneLabel: isLocal ? "Area Terjangkau" : "Luar Jangkauan Instant",
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
      zoneLabel: zone.label,
    };
  });
}
