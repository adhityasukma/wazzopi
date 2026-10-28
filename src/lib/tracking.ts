import "server-only";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import {
  SUPPORTED_COURIERS,
  getCourierName,
  type TrackingCheckpoint,
  type TrackingResult,
} from "./tracking-constants";

export {
  SUPPORTED_COURIERS,
  getCourierName,
  type TrackingCheckpoint,
  type TrackingResult,
};

function cleanCityName(raw?: string): string {
  if (!raw) return "Cimahi";
  const cleaned = raw.replace(/^(kota|kabupaten|kab\.)\s+/i, "").trim();
  if (cleaned.toLowerCase() === "bandung") return "Cimahi";
  return cleaned;
}

function formatDateStr(d: Date): string {
  return (
    d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB"
  );
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
  }
): Promise<TrackingResult> {
  const courier = courierCode.toLowerCase().trim();
  const awb = trackingNumber.trim();
  const courierName = getCourierName(courier);

  // 1. Ambil API Key dari env atau setting database
  let apiKey = process.env.BINDERBYTE_API_KEY;
  if (!apiKey) {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: "binderbyte_api_key" },
      });
      if (setting?.value) {
        apiKey = setting.value;
      }
    } catch {
      // Abaikan jika database setting belum ada
    }
  }

  // 2. Jika API Key ada, coba query live API Binderbyte
  if (apiKey && apiKey.length > 5) {
    try {
      const url = `https://api.binderbyte.com/v1/track?api_key=${apiKey}&courier=${courier}&awb=${encodeURIComponent(awb)}`;
      const res = await fetch(url, {
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 200 && json.data) {
          const d = json.data;
          const isDelivered = d.summary?.status === "DELIVERED";
          const rawHistory: Array<{ date: string; desc: string; location: string }> = d.history || [];

          const checkpoints: TrackingCheckpoint[] = rawHistory.map((h) => ({
            date: h.date,
            desc: h.desc,
            location: cleanCityName(h.location),
            status: isDelivered ? "DELIVERED" : "ON_PROCESS",
          }));

          checkpoints.reverse();

          return {
            success: true,
            courier,
            courierName,
            trackingNumber: awb,
            status: isDelivered ? "DELIVERED" : "ON_PROCESS",
            statusLabel: isDelivered ? "Paket Telah Diterima" : "Sedang Dalam Pengiriman Kurir",
            receiverName: d.summary?.receiver,
            checkpoints,
            isLive: true,
          };
        }
      }
    } catch (err) {
      console.warn("Binderbyte API error, fallback to contextual simulation:", err);
    }
  }

  // 3. Fallback Cerdas Berbasis Kronologi E-commerce Standar
  // Alamat pengirim toko Wazzopi berlokasi di Cimahi
  const originCity = "Cimahi";
  const destCity = cleanCityName(orderContext?.city || originCity);
  const isSameCity = originCity.toLowerCase() === destCity.toLowerCase();

  const created = orderContext?.createdAt ? new Date(orderContext.createdAt) : new Date();
  const customer = orderContext?.customerName || "Pelanggan";
  const isCompleted = orderContext?.status === "COMPLETED";
  const now = new Date();

  // Hitung selisih waktu dari pemesanan hingga saat ini
  const totalElapsed = Math.max(0, now.getTime() - created.getTime());
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
  const t1 = t0 + Math.min(25 * 60 * 1000, Math.max(5 * 60 * 1000, totalElapsed * 0.2));
  rawCheckpoints.push({
    date: formatDateStr(clampDate(t1)),
    desc: `Pesanan telah selesai disiapkan dan dikemas rapi oleh penjual Wazzopi ${originCity}.`,
    location: originCity,
    status: "PROCESSING",
  });

  // Milestone 3: Penjual Mengatur Pengiriman & Menerbitkan Nomor Resi
  const t2 = t0 + Math.min(50 * 60 * 1000, Math.max(12 * 60 * 1000, totalElapsed * 0.35));
  rawCheckpoints.push({
    date: formatDateStr(clampDate(t2)),
    desc: `Penjual telah mengatur pengiriman dengan ${courierName}. Nomor resi terbit: ${awb}. Menunggu penyerahan paket ke kurir.`,
    location: originCity,
    status: "ON_PROCESS",
  });

  // Milestone 4: Paket Diserahkan ke Drop Point / Agen Kurir
  const t3 = t0 + Math.min(80 * 60 * 1000, Math.max(20 * 60 * 1000, totalElapsed * 0.5));
  rawCheckpoints.push({
    date: formatDateStr(clampDate(t3)),
    desc: `Paket telah diserahterimakan dan diterima oleh kurir ${courierName} di Agen/Drop Point ${originCity}.`,
    location: originCity,
    status: "ON_PROCESS",
  });

  // Milestone 5: Fasilitas Sortir Logistik
  if (totalElapsed >= 30 * 60 * 1000 || isCompleted) {
    const t4 = t0 + Math.min(2.5 * 3600 * 1000, Math.max(45 * 60 * 1000, totalElapsed * 0.7));
    rawCheckpoints.push({
      date: formatDateStr(clampDate(t4)),
      desc: isSameCity
        ? `Paket telah diproses di Pusat Sortir logistik ${originCity}. Mempersiapkan rute pengantaran langsung.`
        : `Paket telah diproses di Pusat Sortir logistik ${originCity} dan diberangkatkan menuju ${destCity}.`,
      location: originCity,
      status: "ON_PROCESS",
    });
  }

  // Milestone 6: Kurir Membawa Paket Menuju Alamat Penerima
  if (totalElapsed >= 2 * 3600 * 1000 || isCompleted) {
    const t5 = Math.min(now.getTime() - (isCompleted ? 25 * 60 * 1000 : 5 * 60 * 1000), t0 + 5.5 * 3600 * 1000);
    rawCheckpoints.push({
      date: formatDateStr(clampDate(t5)),
      desc: `Paket sedang dibawa oleh kurir ${courierName} menuju ke alamat penerima di ${destCity}.`,
      location: destCity,
      status: "ON_PROCESS",
    });
  }

  // Milestone 7: Paket Diterima (Hanya jika status pesanan COMPLETED)
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
  };
}
