"use client";

import React, { useState, useTransition } from "react";
import { Truck, Check, AlertCircle, RotateCw, Info, AlertTriangle, X } from "lucide-react";
import { updateOrderTracking } from "@/actions/orders";
import { useI18n } from "@/i18n/provider";
import { useLoading } from "@/components/loading-provider";
import {
  SUPPORTED_COURIERS,
  getCourierName,
  detectCourierByAwb,
  validateAwbForCourier,
} from "@/lib/tracking-constants";
import { OrderTrackingModal, TrackingCheckpoint } from "@/components/shop/order-tracking-modal";

type OrderTrackingFormProps = {
  orderId: string;
  orderNo: string;
  shippingMethod?: string | null;
  currentCourierCode?: string | null;
  currentCourierName?: string | null;
  currentTrackingNumber?: string | null;
  currentTrackingStatus?: string | null;
  trackingHistory?: string | null;
  orderStatus: string;
};

function getInitialCourier(currentCode?: string | null, shippingMethod?: string | null): string {
  if (currentCode) return currentCode;
  const sm = (shippingMethod || "").toLowerCase();
  if (sm.includes("dhl")) return "dhl";
  if (sm.includes("fedex")) return "fedex";
  if (sm.includes("ups")) return "ups";
  if (sm.includes("ems")) return "ems";
  if (sm.includes("aramex")) return "aramex";
  if (sm.includes("singpost") || sm.includes("singapore post")) return "singpost";
  if (sm.includes("usps")) return "usps";
  if (sm.includes("royal mail") || sm.includes("royalmail")) return "royalmail";
  if (sm.includes("jne")) return "jne";
  if (sm.includes("j&t") || sm.includes("jnt")) return "jnt";
  if (sm.includes("sicepat")) return "sicepat";
  if (sm.includes("anteraja")) return "anteraja";
  if (sm.includes("pos")) return "pos";
  if (sm.includes("tiki")) return "tiki";
  if (sm.includes("lion")) return "lion";
  if (sm.includes("ninja")) return "ninja";
  if (sm.includes("spx") || sm.includes("shopee")) return "spx";
  return "jne";
}

export function OrderTrackingForm({
  orderId,
  orderNo,
  shippingMethod,
  currentCourierCode,
  currentCourierName,
  currentTrackingNumber,
  currentTrackingStatus,
  trackingHistory,
  orderStatus,
}: OrderTrackingFormProps) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [courierCode, setCourierCode] = useState(() =>
    getInitialCourier(currentCourierCode, shippingMethod)
  );
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const [validationModal, setValidationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    trackingNumber: string;
    selectedCourierCode: string;
    selectedCourierName: string;
    detectedCourier?: { code: string; name: string } | null;
  } | null>(null);

  let historyList: TrackingCheckpoint[] = [];
  try {
    historyList = trackingHistory ? JSON.parse(trackingHistory) : [];
  } catch {
    historyList = [];
  }

  const detectedMismatch = trackingNumber.trim()
    ? detectCourierByAwb(trackingNumber)
    : null;
  const isMismatch = Boolean(detectedMismatch && detectedMismatch.code !== courierCode);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const trimmedAwb = trackingNumber.trim();
    if (trimmedAwb) {
      const validation = validateAwbForCourier(courierCode, trimmedAwb);
      if (!validation.valid) {
        // Tampilkan preloader sebentar untuk mensimulasikan pengecekan kurir,
        // lalu TUTUP preloader sepenuhnya SEBELUM memunculkan modal peringatan
        showLoading("Memeriksa kesesuaian nomor resi & kurir...");
        setTimeout(() => {
          hideLoading();
          setValidationModal({
            isOpen: true,
            title: "Peringatan Kesesuaian Kurir & Nomor Resi",
            message: validation.error || "Nomor resi tidak sesuai dengan ekspedisi yang dipilih.",
            trackingNumber: trimmedAwb,
            selectedCourierCode: courierCode,
            selectedCourierName: getCourierName(courierCode),
            detectedCourier: validation.detectedCourier || null,
          });
        }, 450);
        return;
      }
    }

    showLoading("Menyimpan & memverifikasi nomor resi...");

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await updateOrderTracking(formData);
        hideLoading();
        if (res.success) {
          setMessage({
            type: "success",
            text:
              (res as any).message ||
              (trackingNumber
                ? "Nomor resi disimpan! Riwayat pelacakan kurir telah diperbarui otomatis."
                : "Nomor resi telah dihapus."),
          });
        } else {
          if ((res as any).isValidationMismatch) {
            setValidationModal({
              isOpen: true,
              title: "Peringatan Kesesuaian Kurir & Nomor Resi",
              message: res.error || "Nomor resi tidak sesuai dengan ekspedisi.",
              trackingNumber: trimmedAwb,
              selectedCourierCode: courierCode,
              selectedCourierName: getCourierName(courierCode),
              detectedCourier: (res as any).detectedCourier || null,
            });
          } else {
            setMessage({ type: "error", text: res.error || "Gagal menyimpan nomor resi" });
          }
        }
      } catch {
        hideLoading();
        setMessage({ type: "error", text: "Terjadi kesalahan saat menyimpan nomor resi" });
      }
    });
  };

  const handleSwitchCourierAndSave = (targetCourierCode: string) => {
    setCourierCode(targetCourierCode);
    setValidationModal(null);
    setMessage(null);
    showLoading(`Menyimpan resi untuk ${getCourierName(targetCourierCode)}...`);

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("id", orderId);
        fd.append("courierCode", targetCourierCode);
        fd.append("trackingNumber", trackingNumber.trim());
        const res = await updateOrderTracking(fd);
        hideLoading();
        if (res.success) {
          setMessage({
            type: "success",
            text:
              (res as any).message ||
              `Nomor resi berhasil disimpan untuk ekspedisi ${getCourierName(targetCourierCode)}!`,
          });
        } else {
          setMessage({ type: "error", text: res.error || "Gagal menyimpan nomor resi" });
        }
      } catch {
        hideLoading();
        setMessage({ type: "error", text: "Gagal menyimpan nomor resi" });
      }
    });
  };

  const handleForceSave = () => {
    setValidationModal(null);
    setMessage(null);
    showLoading("Menyimpan resi dalam mode estimasi toko...");

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("id", orderId);
        fd.append("courierCode", courierCode);
        fd.append("trackingNumber", trackingNumber.trim());
        fd.append("force", "true");
        const res = await updateOrderTracking(fd);
        hideLoading();
        if (res.success) {
          setMessage({
            type: "success",
            text: (res as any).message || "Nomor resi disimpan (mode estimasi toko).",
          });
        } else {
          setMessage({ type: "error", text: res.error || "Gagal menyimpan nomor resi" });
        }
      } catch {
        hideLoading();
        setMessage({ type: "error", text: "Gagal menyimpan nomor resi" });
      }
    });
  };

  return (
    <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-latte pb-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-espresso-900">
          <Truck className="h-5 w-5 text-caramel-600" />
          {isEn ? "Shipping & Tracking Number" : "Pengiriman & Nomor Resi"}
        </h2>
        {currentTrackingNumber && (
          <span className="rounded-full bg-caramel-50 px-2.5 py-0.5 text-xs font-bold text-caramel-700 border border-caramel-200">
            {isEn ? "Active Waybill" : "Resi Aktif"}
          </span>
        )}
      </div>

      <form data-no-loading onSubmit={handleSubmit} className="mt-4 space-y-4">
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-espresso-700">
              {isEn ? "Courier / Carrier" : "Ekspedisi / Kurir"}
            </label>
            {shippingMethod && (
              <span className="text-[11px] font-medium text-espresso-500">
                {isEn ? "Customer Choice:" : "Pilihan Pembeli:"} <strong className="text-caramel-700">{shippingMethod}</strong>
              </span>
            )}
          </div>
          <select
            name="courierCode"
            value={courierCode}
            onChange={(e) => setCourierCode(e.target.value)}
            className="w-full rounded-lg border border-espresso-200 bg-white p-2.5 text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-caramel-500 font-medium"
          >
            <optgroup label={isEn ? "Domestic Couriers (Indonesia)" : "Kurir Domestik (Indonesia)"}>
              {SUPPORTED_COURIERS.filter((c) => !c.isInternational).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code.toUpperCase()})
                </option>
              ))}
            </optgroup>
            <optgroup label={isEn ? "International Couriers (Worldwide)" : "Kurir Internasional (Luar Negeri)"}>
              {SUPPORTED_COURIERS.filter((c) => c.isInternational).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code.toUpperCase()})
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-espresso-700 mb-1">
            {isEn ? "Tracking Number (AWB)" : "Nomor Resi Pengiriman (Airway Bill / AWB)"}
          </label>
          <input
            type="text"
            name="trackingNumber"
            value={trackingNumber}
            onChange={(e) => {
              setTrackingNumber(e.target.value.toUpperCase());
              if (message?.type === "error") setMessage(null);
            }}
            placeholder={isEn ? "E.g.: JNE0192837465, JP12345678" : "Contoh: JNE0192837465, JP12345678"}
            className="w-full font-mono font-bold tracking-wide rounded-lg border border-espresso-200 bg-white p-2.5 text-sm text-espresso-900 placeholder:font-sans placeholder:font-normal placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-caramel-500"
          />

          {isMismatch && detectedMismatch && (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900 border border-amber-200">
              <div className="flex items-center gap-1.5 min-w-0">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="truncate">
                  {isEn ? "Waybill format detected as" : "Format resi terdeteksi sebagai"} <strong>{detectedMismatch.name}</strong> ({detectedMismatch.reason}).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCourierCode(detectedMismatch.code)}
                className="shrink-0 font-bold underline text-amber-800 hover:text-amber-950 cursor-pointer"
              >
                {isEn ? `Switch to ${detectedMismatch.name}` : `Ganti ke ${detectedMismatch.name}`}
              </button>
            </div>
          )}

          <p className="mt-1 text-[11px] text-espresso-400">
            {isEn ? "Once saved, system will automatically track courier waybill checkpoints." : "Setelah disimpan, sistem akan melacak riwayat posisi kurir secara otomatis."}
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
                {isEn ? "Saving & Tracking..." : "Menyimpan & Melacak Kurir..."}
              </>
            ) : (
              isEn ? "Save Waybill & Track Automatically" : "Simpan Resi & Lacak Otomatis"
            )}
          </button>

          {currentTrackingNumber && (
            <div className="flex items-center justify-between pt-2 border-t border-latte/60">
              <OrderTrackingModal
                orderId={orderId}
                orderNo={orderNo}
                courierCode={currentCourierCode || courierCode}
                courierName={currentCourierName || courierCode.toUpperCase()}
                trackingNumber={currentTrackingNumber}
                status={orderStatus}
                trackingStatus={currentTrackingStatus}
                history={historyList}
                shippingMethod={shippingMethod}
                isCustomerView={false}
              />

              <button
                type="button"
                onClick={() => {
                  setTrackingNumber("");
                }}
                className="text-xs text-rose-600 hover:underline"
              >
                {isEn ? "Remove Waybill" : "Hapus Resi"}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Custom Modal Pesan Informasi Validasi */}
      {validationModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-latte overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-latte px-5 py-4 bg-amber-50/70">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 border border-amber-200 text-amber-800">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-espresso-900">
                    {validationModal.title}
                  </h3>
                  <p className="text-[11px] text-espresso-500">
                    {isEn ? "Shipping courier waybill verification" : "Pemeriksaan kesesuaian kurir ekspedisi"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValidationModal(null)}
                className="rounded-lg p-1.5 text-espresso-400 hover:bg-espresso-100 hover:text-espresso-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-latte/30 p-3.5 border border-latte text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-espresso-500 font-medium">{isEn ? "Waybill Number:" : "Nomor Resi:"}</span>
                  <span className="font-mono font-bold text-espresso-950 bg-white px-2 py-0.5 rounded border border-latte">
                    {validationModal.trackingNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-espresso-500 font-medium">{isEn ? "Selected Courier:" : "Ekspedisi Dipilih:"}</span>
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {validationModal.selectedCourierName}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-rose-50 p-3.5 text-xs text-rose-900 border border-rose-200 leading-relaxed font-medium">
                {validationModal.message}
              </div>

              {validationModal.detectedCourier && (
                <div className="rounded-xl bg-emerald-50 p-3.5 text-xs text-emerald-950 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{isEn ? "Suggested Courier:" : "Saran Ekspedisi Otomatis:"}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {isEn ? (
                      <>
                        This waybill number matches the official format for{" "}
                        <strong>{validationModal.detectedCourier.name}</strong>.
                      </>
                    ) : (
                      <>
                        Karakteristik nomor resi ini teridentifikasi sebagai format pengiriman resmi{" "}
                        <strong>{validationModal.detectedCourier.name}</strong>.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer / Actions */}
            <div className="border-t border-latte px-5 py-4 bg-cream/40 flex flex-col gap-2">
              {validationModal.detectedCourier && (
                <button
                  type="button"
                  onClick={() =>
                    handleSwitchCourierAndSave(validationModal.detectedCourier!.code)
                  }
                  disabled={isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-caramel-600 hover:bg-caramel-700 text-white py-2.5 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  {isEn ? `Switch to ${validationModal.detectedCourier.name} & Save` : `Ganti ke ${validationModal.detectedCourier.name} & Simpan`}
                </button>
              )}

              <button
                type="button"
                onClick={() => setValidationModal(null)}
                className="inline-flex w-full items-center justify-center rounded-xl border border-espresso-200 bg-white hover:bg-espresso-50 text-espresso-700 py-2.5 text-xs font-semibold transition cursor-pointer"
              >
                {isEn ? "Check Tracking Number Again" : "Periksa Kembali Nomor Resi"}
              </button>

              <button
                type="button"
                onClick={handleForceSave}
                disabled={isPending}
                className="text-center text-[11px] text-espresso-400 hover:text-espresso-700 hover:underline pt-1 cursor-pointer"
              >
                {isEn ? `Keep and Save as ${validationModal.selectedCourierName} (Store Estimation Mode)` : `Tetap Simpan sebagai ${validationModal.selectedCourierName} (Mode Estimasi Toko)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
