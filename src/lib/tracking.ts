import "server-only";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import {
  SUPPORTED_COURIERS,
  getCourierName,
  detectCourierByAwb,
  validateAwbForCourier,
  getCourierTrackingUrl,
  resolveEffectiveCourier,
  type TrackingCheckpoint,
  type TrackingResult,
  type EffectiveCourierResolution,
} from "./tracking-constants";

export {
  SUPPORTED_COURIERS,
  getCourierName,
  detectCourierByAwb,
  validateAwbForCourier,
  getCourierTrackingUrl,
  resolveEffectiveCourier,
  type TrackingCheckpoint,
  type TrackingResult,
  type EffectiveCourierResolution,
};

function cleanCityName(raw?: string, fallback = "Tangerang"): string {
  if (!raw) return fallback;
  const cleaned = raw.replace(/^(kota|kabupaten|kab\.)\s+/i, "").trim();
  return cleaned || fallback;
}

function formatDateStr(d: Date): string {
  return (
    d.toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
}

function formatApiDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const parsed = new Date(dateStr.replace(" ", "T"));
    if (!isNaN(parsed.getTime())) {
      return formatDateStr(parsed);
    }
  } catch {
    // Abaikan jika parsing gagal
  }
  return dateStr;
}

export function parseCheckpointDate(dateStr: string): number {
  if (!dateStr) return 0;
  const cleaned = dateStr.replace(/WIB|WITA|WIT/gi, "").trim();
  const direct = new Date(cleaned.replace(" ", "T"));
  if (!isNaN(direct.getTime())) return direct.getTime();

  // Format DD-MM-YYYY HH:mm:ss atau DD-MM-YYYY HH:mm
  const dmyMatch = cleaned.match(
    /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})(?:\s+(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?)?/
  );
  if (dmyMatch) {
    const [, day, month, year, h = "0", m = "0", s = "0"] = dmyMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(h),
      Number(m),
      Number(s)
    ).getTime();
  }

  // Format Indo: "7 Okt 2026, 07.45"
  const indoMonths: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
    jul: 6, agu: 7, ags: 7, sep: 8, okt: 9, nov: 10, des: 11,
  };
  const indoMatch = cleaned.match(
    /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})(?:,\s*(\d{1,2})[:.](\d{1,2}))?/
  );
  if (indoMatch) {
    const [, day, monStr, year, h = "0", m = "0"] = indoMatch;
    const mon = indoMonths[monStr.slice(0, 3).toLowerCase()] ?? 0;
    return new Date(Number(year), mon, Number(day), Number(h), Number(m)).getTime();
  }

  return 0;
}

/**
 * Mengambil informasi tracking resi ekspedisi.
 * Jika API Key Binderbyte tersedia, memanggil API resmi secara otomatis.
 * Jika tidak tersedia atau terjadi error (misal resi testing/dummy),
 * menyediakan milestone realistis berbasis kronologi pesanan dan rute wilayah asal-tujuan.
 */
export async function trackShipment(
  courierCode: string,
  trackingNumber: string,
  orderContext?: {
    orderNo: string;
    customerName: string;
    city: string;
    createdAt: Date;
    status: string;
    trackingUpdatedAt?: Date | null;
  }
): Promise<TrackingResult> {
  const courier = courierCode.toLowerCase().trim();
  const awb = trackingNumber.trim();
  const courierName = getCourierName(courier);

  // 1. Ambil kota asal pengirim dari pengaturan toko & API Key Binderbyte
  let storeOrigin = "Tangerang";
  let apiKey = process.env.BINDERBYTE_API_KEY;
  try {
    const settings = await getSettings();
    if (settings.shipping?.originCity?.trim()) {
      storeOrigin = settings.shipping.originCity.trim();
    } else if (settings.general?.city?.trim()) {
      storeOrigin = settings.general.city.trim();
    }
    if (!apiKey && settings.shipping?.binderbyteApiKey?.trim()) {
      apiKey = settings.shipping.binderbyteApiKey.trim();
    }
  } catch {
    // Abaikan jika database setting belum ada
  }

  const originCity = cleanCityName(storeOrigin, "Tangerang");
  const destCity = cleanCityName(orderContext?.city, originCity);
  const isSameCity = originCity.toLowerCase() === destCity.toLowerCase();

  // 2. Cek juga jika API Key tersimpan di baris setting database terpisah
  if (!apiKey) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "binderbyte_api_key" },
      });
      if (setting?.value) {
        apiKey = setting.value.trim();
      }
    } catch {
      // Abaikan jika database setting belum ada
    }
  }

  // 3. Jika API Key ada, coba query live API Binderbyte
  let liveApiError: string | undefined;

  if (apiKey && apiKey.length > 5) {
    try {
      const url = `https://api.binderbyte.com/v1/track?api_key=${apiKey}&courier=${courier}&awb=${encodeURIComponent(awb)}`;
      const res = await fetch(url, {
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 200 && json.data) {
          const d = json.data;
          const isApiDelivered = d.summary?.status === "DELIVERED";
          const isOrderCompleted = (orderContext?.status || "").toUpperCase() === "COMPLETED";
          const isDelivered = isApiDelivered || isOrderCompleted;

          const rawHistory: Array<{ date: string; desc: string; location: string }> = d.history || [];

          const checkpoints: TrackingCheckpoint[] = rawHistory.map((h, idx) => ({
            date: formatApiDate(h.date),
            desc: h.desc,
            location: cleanCityName(h.location, originCity),
            status: isDelivered && idx === 0 ? "DELIVERED" : "ON_PROCESS",
          }));

          // Urutkan selalu dari peristiwa terbaru (newest first) ke terlama
          checkpoints.sort((a, b) => {
            const timeA = parseCheckpointDate(a.date);
            const timeB = parseCheckpointDate(b.date);
            return timeB - timeA;
          });

          // Jika pesanan toko COMPLETED namun belum ada milestone DELIVERED dari API
          if (
            isOrderCompleted &&
            !checkpoints.some(
              (c) =>
                c.status === "DELIVERED" ||
                c.desc.toLowerCase().includes("diterima") ||
                c.desc.toLowerCase().includes("terkirim")
            )
          ) {
            checkpoints.unshift({
              date: formatDateStr(new Date()),
              desc: `Paket telah diterima di alamat tujuan oleh [${orderContext?.customerName || "Pelanggan"}]. Transaksi selesai.`,
              location: destCity,
              status: "DELIVERED",
            });
          }

          // Pastikan checkpoint teratas memiliki status DELIVERED jika paket sudah sampai
          if (isDelivered && checkpoints.length > 0) {
            checkpoints[0].status = "DELIVERED";
          }

          return {
            success: true,
            courier,
            courierName,
            trackingNumber: awb,
            status: isDelivered ? "DELIVERED" : "ON_PROCESS",
            statusLabel: isDelivered ? "Paket Telah Diterima" : "Sedang Dalam Pengiriman Kurir",
            receiverName: d.summary?.receiver || (isOrderCompleted ? orderContext?.customerName : undefined),
            checkpoints,
            isLive: true,
          };
        } else {
          liveApiError = json.message || "Nomor resi tidak ditemukan di server ekspedisi resmi";
        }
      } else {
        try {
          const json = await res.json();
          liveApiError = json.message || `Server ekspedisi merespons error (HTTP ${res.status})`;
        } catch {
          liveApiError = `Server ekspedisi merespons error (HTTP ${res.status})`;
        }
      }
    } catch (err) {
      console.warn("Binderbyte API error, fallback to contextual simulation:", err);
      liveApiError = "Gagal terhubung ke API pelacak ekspedisi";
    }
  }

  // 4. Fallback Cerdas Berbasis Kronologi E-commerce Standar
  const created = orderContext?.createdAt ? new Date(orderContext.createdAt) : new Date();
  const customer = orderContext?.customerName || "Pelanggan";
  const orderStatus = (orderContext?.status || "SHIPPED").toUpperCase();
  const isCompleted = orderStatus === "COMPLETED";
  const now = new Date();

  // Waktu saat resi diterbitkan/diperbarui
  const shippedAt = orderContext?.trackingUpdatedAt
    ? new Date(orderContext.trackingUpdatedAt)
    : now;
  // Pastikan waktu pengiriman tidak mendahului waktu pembuatan pesanan
  const tShipped = Math.min(now.getTime(), Math.max(created.getTime(), shippedAt.getTime()));

  // Selisih waktu sejak nomor resi diterbitkan (pengiriman aktif)
  const shippedElapsed = Math.max(0, now.getTime() - tShipped);
  const t0 = created.getTime();

  // Helper agar timestamp tidak pernah melampaui waktu sekarang (strictly <= now)
  const clampDate = (targetTime: number) => {
    const clampedTime = Math.min(Math.max(t0, targetTime), now.getTime());
    return new Date(clampedTime);
  };

  const rawCheckpoints: TrackingCheckpoint[] = [];

  // Milestone 1: Pesanan Dibuat
  rawCheckpoints.push({
    date: formatDateStr(created),
    desc: "Pesanan telah berhasil dibuat dan terkonfirmasi di sistem toko.",
    location: originCity,
    status: "PENDING",
  });

  // Milestone 2: Pengemasan oleh Penjual
  const tPackaging = t0 + Math.min(25 * 60 * 1000, Math.max(5 * 60 * 1000, (tShipped - t0) * 0.5));
  rawCheckpoints.push({
    date: formatDateStr(clampDate(tPackaging)),
    desc: `Pesanan telah selesai disiapkan dan dikemas rapi oleh penjual Wazzopi ${originCity}.`,
    location: originCity,
    status: "PROCESSING",
  });

  // Milestone 3: Penjual Mengatur Pengiriman & Menerbitkan Nomor Resi
  rawCheckpoints.push({
    date: formatDateStr(clampDate(tShipped)),
    desc: `Penjual telah mengatur pengiriman dengan ${courierName}. Nomor resi terbit: ${awb}. Menunggu penyerahan paket ke kurir.`,
    location: originCity,
    status: "ON_PROCESS",
  });

  // Milestone 4: Paket Diserahkan ke Drop Point / Agen Kurir
  // Hanya muncul jika sudah berlalu minimal 2 jam sejak resi diterbitkan ATAU pesanan sudah COMPLETED
  if (shippedElapsed >= 2 * 3600 * 1000 || isCompleted) {
    const tDropPoint = tShipped + Math.min(1.5 * 3600 * 1000, shippedElapsed * 0.4);
    rawCheckpoints.push({
      date: formatDateStr(clampDate(tDropPoint)),
      desc: `Paket telah diserahterimakan dan diterima oleh kurir ${courierName} di Agen/Drop Point ${originCity}.`,
      location: originCity,
      status: "ON_PROCESS",
    });
  }

  // Milestone 5: Pusat Sortir Logistik Kota Asal
  // Hanya muncul jika sudah berlalu minimal 6 jam sejak resi diterbitkan ATAU pesanan sudah COMPLETED
  if (shippedElapsed >= 6 * 3600 * 1000 || isCompleted) {
    const tSortir = tShipped + Math.min(5 * 3600 * 1000, shippedElapsed * 0.65);
    rawCheckpoints.push({
      date: formatDateStr(clampDate(tSortir)),
      desc: isSameCity
        ? `Paket telah diproses di Pusat Sortir logistik ${originCity}. Mempersiapkan rute pengantaran ke alamat tujuan.`
        : `Paket telah diproses di Pusat Sortir logistik ${originCity} dan sedang diberangkatkan menuju kota tujuan (${destCity}).`,
      location: originCity,
      status: "ON_PROCESS",
    });
  }

  // Milestone 6: Kurir Membawa Paket Menuju Alamat Penerima di Kota Tujuan
  // Hanya muncul jika sudah berlalu minimal 20 jam sejak resi diterbitkan ATAU pesanan sudah COMPLETED
  if (shippedElapsed >= 20 * 3600 * 1000 || isCompleted) {
    const tDelivery = tShipped + Math.min(22 * 3600 * 1000, shippedElapsed * 0.9);
    rawCheckpoints.push({
      date: formatDateStr(clampDate(tDelivery)),
      desc: `Paket telah tiba di fasilitas logistik ${destCity} dan sedang dibawa oleh kurir ${courierName} menuju alamat penerima.`,
      location: destCity,
      status: "ON_PROCESS",
    });
  }

  // Milestone 7: Paket Diterima (HANYA jika status pesanan COMPLETED)
  if (isCompleted) {
    rawCheckpoints.push({
      date: formatDateStr(now),
      desc: `Paket telah diterima dengan baik di alamat tujuan oleh [${customer} (Penerima Sendiri)]. Transaksi selesai.`,
      location: destCity,
      status: "DELIVERED",
    });
  }

  // Urutkan dari yang terbaru (paling atas) ke yang terlama (paling bawah)
  rawCheckpoints.reverse();

  return {
    success: true,
    courier,
    courierName,
    trackingNumber: awb,
    status: isCompleted ? "DELIVERED" : "ON_PROCESS",
    statusLabel: isCompleted ? "Paket Telah Diterima" : "Sedang Dalam Pengiriman Kurir",
    receiverName: isCompleted ? customer : undefined,
    checkpoints: rawCheckpoints,
    isLive: false,
    liveApiError,
  };
}
