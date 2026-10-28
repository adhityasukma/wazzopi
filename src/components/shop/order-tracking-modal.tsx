"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  Package,
  CheckCircle2,
  MapPin,
  Copy,
  Check,
  RotateCw,
  Clock,
  X,
  ExternalLink,
} from "lucide-react";
import { confirmOrderReceived, refreshOrderTracking } from "@/actions/orders";

export type TrackingCheckpoint = {
  date: string;
  desc: string;
  location?: string;
  status?: string;
};

type OrderTrackingModalProps = {
  orderId: string;
  orderNo: string;
  courierName: string;
  trackingNumber: string;
  status: string;
  trackingStatus?: string | null;
  history: TrackingCheckpoint[];
  isCustomerView?: boolean;
};

export function OrderTrackingModal({
  orderId,
  orderNo,
  courierName,
  trackingNumber,
  status,
  trackingStatus,
  history,
  isCustomerView = true,
}: OrderTrackingModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const sanitizeHistory = (items: TrackingCheckpoint[]) => {
    return (items || []).map((cp) => {
      let loc = cp.location;
      if (
        loc === "Bandung Hub" ||
        loc === "Gudang Wazzopi Roastery" ||
        loc === "Sistem Wazzopi"
      ) {
        loc = "Cimahi";
      }
      return { ...cp, location: loc };
    });
  };

  const [currentHistory, setCurrentHistory] = useState<TrackingCheckpoint[]>(() =>
    sanitizeHistory(history)
  );

  useEffect(() => {
    if (history) {
      setCurrentHistory(sanitizeHistory(history));
    }
  }, [history]);

  const handleCopyResi = () => {
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await refreshOrderTracking(orderId);
      if (res?.success && res?.tracking?.checkpoints) {
        setCurrentHistory(sanitizeHistory(res.tracking.checkpoints));
      }
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleConfirmReceived = async () => {
    if (!window.confirm("Apakah Anda yakin telah menerima paket ini dalam kondisi baik?")) {
      return;
    }
    setIsConfirming(true);
    try {
      await confirmOrderReceived(orderId);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsConfirming(false);
    }
  };

  const isDelivered = status === "COMPLETED" || trackingStatus === "DELIVERED";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-caramel-500/40 bg-caramel-50 px-3 py-1.5 text-xs font-semibold text-caramel-700 hover:bg-caramel-100 transition-colors shadow-2xs"
      >
        <Truck className="h-3.5 w-3.5 text-caramel-600" />
        Lacak Pengiriman
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-latte overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-latte px-6 py-4 bg-espresso-50/50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-caramel-100 border border-caramel-200 text-caramel-700">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-espresso-900">
                    Lacak Pengiriman Paket
                  </h3>
                  <p className="text-xs text-espresso-500 font-mono">
                    No. Pesanan: #{orderNo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-espresso-400 hover:bg-espresso-100 hover:text-espresso-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Courier & Waybill Info Card */}
            <div className="px-6 py-4 border-b border-latte/60 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-latte/30 p-4 border border-latte">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-espresso-400">
                    Ekspedisi Kurir
                  </span>
                  <p className="text-sm font-bold text-espresso-900">{courierName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs font-bold text-caramel-700 bg-white px-2 py-0.5 rounded border border-latte">
                      {trackingNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyResi}
                      className="inline-flex items-center gap-1 text-[11px] text-espresso-600 hover:text-caramel-600 transition-colors font-medium"
                      title="Salin nomor resi"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600">Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      isDelivered
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-caramel-100 text-caramel-800 border border-caramel-200"
                    }`}
                  >
                    {isDelivered ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Paket Diterima
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-caramel-600" />
                        Dalam Pengiriman
                      </>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center gap-1 text-[11px] text-espresso-500 hover:text-espresso-800 transition-colors disabled:opacity-50"
                  >
                    <RotateCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                    Perbarui status
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper Timeline Ala Shopee (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-espresso-400 mb-4">
                Riwayat Perjalanan Paket
              </h4>

              {currentHistory.length === 0 ? (
                <div className="py-8 text-center text-espresso-500 text-sm">
                  Belum ada catatan riwayat perjalanan untuk nomor resi ini.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-espresso-100">
                  {currentHistory.map((cp, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div key={idx} className="relative group">
                        {/* Milestone Node */}
                        <div
                          className={`absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                            isLatest
                              ? isDelivered
                                ? "bg-emerald-500 border-emerald-200 text-white ring-4 ring-emerald-100"
                                : "bg-caramel-500 border-caramel-200 text-white ring-4 ring-caramel-100"
                              : "bg-white border-espresso-300 text-espresso-400"
                          }`}
                        >
                          {isLatest ? (
                            isDelivered ? (
                              <Check className="h-3 w-3 stroke-[3]" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            )
                          ) : (
                            <div className="h-1.5 w-1.5 rounded-full bg-espresso-300" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-xs font-mono font-semibold ${
                                isLatest ? "text-espresso-900 font-bold" : "text-espresso-400"
                              }`}
                            >
                              {cp.date}
                            </span>
                            {cp.location && (
                              <span className="inline-flex items-center gap-0.5 text-[11px] text-espresso-500 bg-espresso-50 px-1.5 py-0.5 rounded border border-espresso-100">
                                <MapPin className="h-2.5 w-2.5 text-caramel-500" />
                                {cp.location}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs leading-relaxed ${
                              isLatest
                                ? "font-medium text-espresso-900"
                                : "text-espresso-600"
                            }`}
                          >
                            {cp.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-latte px-6 py-4 bg-espresso-50/50 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-espresso-500">
                Layanan Pelacakan Otomatis Wazzopi
              </span>

              <div className="flex items-center gap-2.5">
                {isCustomerView && !isDelivered && (
                  <button
                    type="button"
                    onClick={handleConfirmReceived}
                    disabled={isConfirming}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {isConfirming ? "Memproses..." : "Pesanan Sudah Diterima"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-espresso-200 bg-white px-4 py-2 text-xs font-semibold text-espresso-700 hover:bg-espresso-100 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
