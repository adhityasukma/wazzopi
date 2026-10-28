export type TrackingCheckpoint = {
  date: string;
  desc: string;
  location?: string;
  status?: string;
};

export type TrackingResult = {
  success: boolean;
  courier: string;
  courierName: string;
  trackingNumber: string;
  status: "PENDING" | "PROCESSING" | "ON_PROCESS" | "DELIVERED" | "FAILED";
  statusLabel: string;
  receiverName?: string;
  checkpoints: TrackingCheckpoint[];
  isLive: boolean;
  liveApiError?: string;
  error?: string;
};

export const SUPPORTED_COURIERS: { code: string; name: string }[] = [
  { code: "jne", name: "JNE Express" },
  { code: "jnt", name: "J&T Express" },
  { code: "sicepat", name: "SiCepat Ekspres" },
  { code: "anteraja", name: "Anteraja" },
  { code: "pos", name: "POS Indonesia" },
  { code: "tiki", name: "TIKI" },
  { code: "ninja", name: "Ninja Xpress" },
  { code: "lion", name: "Lion Parcel" },
  { code: "wahana", name: "Wahana Express" },
  { code: "ide", name: "ID Express" },
  { code: "spx", name: "Shopee Xpress" },
];

export function getCourierName(code: string): string {
  const found = SUPPORTED_COURIERS.find((c) => c.code.toLowerCase() === code.toLowerCase());
  return found ? found.name : code.toUpperCase();
}

/**
 * Mendeteksi kemungkinan kurir berdasarkan karakteristik nomor resi Indonesia.
 */
export function detectCourierByAwb(awbRaw: string): { code: string; name: string; reason: string } | null {
  const awb = awbRaw.trim().toUpperCase();
  if (!awb || awb.length < 4) return null;

  // JNE Express: awalan kode cabang kota (CM, CGK, BDO, BDG, SUB, SOC, JOG, SMG, DPS, MDN, PLM, BPN, UPG, TGR, BKI, BOO, DPK) diikuti angka, atau awalan JNE, atau numerik 15-16 digit
  if (
    /^(CM|CGK|BDO|BDG|SUB|SOC|JOG|SMG|DPS|MDN|PLM|BPN|UPG|TGR|BKI|BOO|DPK|JNE)\d{8,14}$/.test(awb) ||
    (awb.startsWith("CM") && awb.length >= 10) ||
    /^\d{15,16}$/.test(awb)
  ) {
    const isNum = /^\d+$/.test(awb);
    const prefix2 = awb.slice(0, 2);
    const branchName = prefix2 === "CM" ? "Cimahi" : prefix2;
    return {
      code: "jne",
      name: "JNE Express",
      reason: isNum
        ? "15–16 digit numerik adalah format standar resi JNE Express"
        : `Awalan '${prefix2 === "CM" ? "CM" : awb.slice(0, 3)}' adalah kode cabang resmi JNE Express (${branchName})`,
    };
  }

  // Shopee Xpress: awalan SPXID...
  if (awb.startsWith("SPXID") || awb.startsWith("SPX")) {
    return { code: "spx", name: "Shopee Xpress", reason: "Awalan SPXID adalah format khas Shopee Xpress" };
  }

  // J&T Express: awalan JP, JX, JZ, JT, JS diikuti angka
  if (/^J[PXZTS]\d+/.test(awb) || (/^J[PXZTS]/.test(awb) && awb.length >= 8)) {
    return { code: "jnt", name: "J&T Express", reason: "Awalan " + awb.slice(0, 2) + " adalah format khas J&T Express" };
  }

  // Ninja Xpress: awalan NLID atau SHP
  if (awb.startsWith("NLID") || awb.startsWith("SHP")) {
    return { code: "ninja", name: "Ninja Xpress", reason: "Awalan " + awb.slice(0, 4) + " adalah format khas Ninja Xpress" };
  }

  // Lion Parcel: awalan LP atau 11 digit angka diawali 98, 99, 11, 12, dll.
  if (
    (awb.startsWith("LP") && awb.length >= 8) ||
    (/^\d{11}$/.test(awb) && (awb.startsWith("98") || awb.startsWith("99") || awb.startsWith("11") || awb.startsWith("12") || awb.startsWith("10")))
  ) {
    return {
      code: "lion",
      name: "Lion Parcel",
      reason: /^\d{11}$/.test(awb)
        ? `Nomor resi 11 digit diawali '${awb.slice(0, 2)}' adalah format khas Lion Parcel`
        : "Awalan LP adalah format khas Lion Parcel",
    };
  }

  // ID Express: awalan IDE atau IDS
  if (awb.startsWith("IDE") || awb.startsWith("IDS")) {
    return { code: "ide", name: "ID Express", reason: "Awalan " + awb.slice(0, 3) + " adalah format khas ID Express" };
  }

  // SiCepat: 12 digit diawali '00' (misal 00281..., 0041...)
  if (/^00\d{10}$/.test(awb)) {
    return { code: "sicepat", name: "SiCepat Ekspres", reason: "12 digit diawali 00 adalah format standar SiCepat" };
  }

  // Anteraja: 13-14 digit diawali '100'
  if (/^100\d{10,11}$/.test(awb)) {
    return { code: "anteraja", name: "Anteraja", reason: "13-14 digit diawali 100 adalah format standar Anteraja" };
  }

  return null;
}

/**
 * Validasi apakah nomor resi valid dan cocok dengan kurir yang dipilih.
 */
export function validateAwbForCourier(
  courierCode: string,
  awbRaw: string
): { valid: boolean; error?: string; detectedCourier?: { code: string; name: string } } {
  const awb = awbRaw.trim().toUpperCase();
  const courier = courierCode.toLowerCase().trim();
  const courierName = getCourierName(courier);

  if (!awb) {
    return { valid: true };
  }

  // 1. Cek karakter: hanya huruf dan angka
  if (/[^A-Z0-9]/.test(awb)) {
    return {
      valid: false,
      error: "Nomor resi hanya boleh berisi kombinasi huruf dan angka tanpa spasi atau simbol khusus.",
    };
  }

  // 2. Cek panjang karakter
  if (awb.length < 8) {
    return {
      valid: false,
      error: `Nomor resi terlalu pendek (${awb.length} karakter). Nomor resi ekspedisi minimal 8 karakter.`,
    };
  }
  if (awb.length > 30) {
    return {
      valid: false,
      error: `Nomor resi terlalu panjang (${awb.length} karakter). Maksimal 30 karakter.`,
    };
  }

  // 3. Deteksi bentrok format kurir
  const detected = detectCourierByAwb(awb);
  if (detected && detected.code !== courier) {
    return {
      valid: false,
      error: `Nomor resi ini berformat ${detected.name} (${detected.reason}), tetapi ekspedisi yang dipilih adalah ${courierName}.`,
      detectedCourier: { code: detected.code, name: detected.name },
    };
  }

  // 4. Validasi spesifik per kurir
  if (courier === "jne") {
    // Nomor resi numerik JNE minimal 13 digit (standar 15-16 digit)
    if (/^\d+$/.test(awb) && awb.length < 13) {
      return {
        valid: false,
        error: `Nomor resi numerik JNE Express umumnya terdiri dari 15–16 digit (minimal 13 digit). Nomor yang dimasukkan hanya ${awb.length} digit.`,
        detectedCourier: detected ? { code: detected.code, name: detected.name } : undefined,
      };
    }
  }

  if (courier === "sicepat") {
    if (/^\d+$/.test(awb) && awb.length !== 12) {
      return {
        valid: false,
        error: `Resi numerik SiCepat umumnya terdiri dari 12 digit angka (nomor yang dimasukkan memiliki ${awb.length} digit).`,
        detectedCourier: detected ? { code: detected.code, name: detected.name } : undefined,
      };
    }
  }

  if (courier === "anteraja") {
    if (/^\d+$/.test(awb) && (awb.length < 13 || awb.length > 14)) {
      return {
        valid: false,
        error: `Resi numerik Anteraja umumnya terdiri dari 13-14 digit angka (nomor yang dimasukkan memiliki ${awb.length} digit).`,
        detectedCourier: detected ? { code: detected.code, name: detected.name } : undefined,
      };
    }
  }

  if (courier === "lion") {
    const isLionValid =
      (awb.startsWith("LP") && awb.length >= 8) ||
      (/^\d{11}$/.test(awb) && !awb.startsWith("00") && !awb.startsWith("100"));
    if (!isLionValid) {
      return {
        valid: false,
        error: `Nomor resi Lion Parcel harus berupa 11 digit angka (misal: 9817...) atau diawali 'LP'. Resi '${awb}' tidak valid untuk Lion Parcel.`,
        detectedCourier: detected ? { code: detected.code, name: detected.name } : undefined,
      };
    }
  }

  return { valid: true };
}
