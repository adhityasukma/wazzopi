"use client";

import React, { useState, useTransition } from "react";
import { Truck, Check, AlertCircle, RotateCw } from "lucide-react";
import { updateOrderTracking } from "@/actions/orders";
import { SUPPORTED_COURIERS } from "@/lib/tracking";
import { OrderTrackingModal, TrackingCheckpoint } from "@/components/shop/order-tracking-modal";

type OrderTrackingFormProps = {
  orderId: string;
  orderNo: string;
  currentCourierCode?: string | null;
  currentCourierName?: string | null;
  currentTrackingNumber?: string | null;
  currentTrackingStatus?: string | null;
  trackingHistory?: string | null;
  orderStatus: string;
};

export function OrderTrackingForm({
  orderId,
  orderNo,
  currentCourierCode,
  currentCourierName,
  currentTrackingNumber,
  currentTrackingStatus,
  trackingHistory,
  orderStatus,
}: OrderTrackingFormProps) {
  const [courierCode, setCourierCode] = useState(currentCourierCode || "jne");
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  let historyList: TrackingCheckpoint[] = [];
  try {
    historyList = trackingHistory ? JSON.parse(trackingHistory) : [];
  } catch {
    historyList = [];
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateOrderTracking(formData);
      if (res.success) {
        setMessage({
          type: "success",
          text: trackingNumber
            ? "Nomor resi disimpan! Riwayat pelacakan kurir telah diperbarui otomatis."
            : "Nomor resi telah dihapus.",
        });
      } else {
        setMessage({ type: "error", text: res.error || "Gagal menyimpan nomor resi" });
      }
    });
  };

  return (
    <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-latte pb-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-espresso-900">
          <Truck className="h-5 w-5 text-caramel-600" />
          Pengiriman &amp; Nomor Resi
        </h2>
        {currentTrackingNumber && (
          <span className="rounded-full bg-caramel-50 px-2.5 py-0.5 text-xs font-bold text-caramel-700 border border-caramel-200">
            Resi Aktif
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input type="hidden" name="id" value={orderId} />

        {message && (
          <div
            className={`flex items-start gap-2 rounded-lg p-3 text-xs font-medium ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-espresso-700 mb-1">
            Ekspedisi / Kurir
          </label>
          <select
            name="courierCode"
            value={courierCode}
            onChange={(e) => setCourierCode(e.target.value)}
            className="w-full rounded-lg border border-espresso-200 bg-white p-2.5 text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-caramel-500"
          >
            {SUPPORTED_COURIERS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-espresso-700 mb-1">
            Nomor Resi Pengiriman (Airway Bill / AWB)
          </label>
          <input
            type="text"
            name="trackingNumber"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
            placeholder="Contoh: JNE0192837465, JP12345678"
            className="w-full font-mono font-bold tracking-wide rounded-lg border border-espresso-200 bg-white p-2.5 text-sm text-espresso-900 placeholder:font-sans placeholder:font-normal placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-caramel-500"
          />
          <p className="mt-1 text-[11px] text-espresso-400">
            Setelah disimpan, sistem akan melacak riwayat posisi kurir secara otomatis.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-caramel-600 py-2.5 text-xs font-semibold text-white hover:bg-caramel-700 transition-colors shadow-2xs disabled:opacity-50"
          >
            {isPending ? (
              <>
                <RotateCw className="h-3.5 w-3.5 animate-spin" />
                Menyimpan &amp; Melacak Kurir...
              </>
            ) : (
              "Simpan Resi &amp; Lacak Otomatis"
            )}
          </button>

          {currentTrackingNumber && (
            <div className="flex items-center justify-between pt-2 border-t border-latte/60">
              <OrderTrackingModal
                orderId={orderId}
                orderNo={orderNo}
                courierName={currentCourierName || courierCode.toUpperCase()}
                trackingNumber={currentTrackingNumber}
                status={orderStatus}
                trackingStatus={currentTrackingStatus}
                history={historyList}
                isCustomerView={false}
              />

              <button
                type="button"
                onClick={() => {
                  setTrackingNumber("");
                }}
                className="text-xs text-rose-600 hover:underline"
              >
                Hapus Resi
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
