"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";
import { requestSnapPayment, confirmMidtransSuccess } from "@/actions/midtrans";
import { useAppLoading } from "@/components/loading-provider";
import { useI18n } from "@/i18n/provider";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

function loadSnapScript(clientKey: string, isProduction: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptId = "midtrans-snap-script";
    if (document.getElementById(scriptId) && window.snap) {
      resolve();
      return;
    }

    const scriptSrc = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";

    // Hapus script lama jika ada
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = scriptSrc;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat sistem Midtrans Snap"));

    document.body.appendChild(script);
  });
}

export function MidtransPayButton({
  orderNo,
  buttonLabel = "Bayar Sekarang",
  autoOpen = false,
  className = "",
  variant = "primary",
}: {
  orderNo: string;
  buttonLabel?: string;
  autoOpen?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "outline";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { showLoading, hideLoading } = useAppLoading();
  const { locale } = useI18n();
  const isEn = locale === "en";
  const autoOpenedRef = useRef(false);

  async function handlePay() {
    if (loading) return;
    setError(null);
    setLoading(true);
    showLoading(
      isEn
        ? "Opening Midtrans payment gateway..."
        : "Membuka gerbang pembayaran Midtrans..."
    );

    try {
      const res = await requestSnapPayment(orderNo);

      if ("error" in res) {
        throw new Error(res.error);
      }

      await loadSnapScript(res.clientKey, res.isProduction);

      hideLoading();
      setLoading(false);

      if (!window.snap) {
        throw new Error(
          isEn
            ? "Midtrans Snap service is not ready"
            : "Layanan Snap Midtrans belum siap"
        );
      }

      window.snap.pay(res.token, {
        onSuccess: async () => {
          showLoading(
            isEn
              ? "Confirming your payment..."
              : "Mengonfirmasi pembayaran Anda..."
          );
          await confirmMidtransSuccess(orderNo);
          hideLoading();
          router.refresh();
        },
        onPending: () => {
          hideLoading();
          router.refresh();
        },
        onError: (result) => {
          hideLoading();
          setError("Pembayaran gagal atau dibatalkan oleh bank");
          console.warn("[Midtrans Snap Error]", result);
        },
        onClose: () => {
          hideLoading();
        },
      });
    } catch (err: any) {
      hideLoading();
      setLoading(false);
      setError(err.message || "Gagal membuka pembayaran Midtrans");
    }
  }

  // Jika autoOpen aktif, picu otomatis pop-up Snap sekali saat halaman pertama kali dibuka
  useEffect(() => {
    if (autoOpen && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      // Beri sedikit jeda agar transisi halaman selesai
      const timer = setTimeout(() => {
        handlePay();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoOpen]);

  const buttonStyle =
    variant === "outline"
      ? "border border-caramel-500 bg-white text-caramel-700 hover:bg-caramel-50"
      : variant === "secondary"
      ? "bg-caramel-600 text-white hover:bg-caramel-700 shadow-sm"
      : "bg-espresso-700 text-cream hover:bg-espresso-800 shadow-md";

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        disabled={loading}
        onClick={handlePay}
        className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wide transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${buttonStyle} ${className}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-caramel-300" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        <span>{loading ? "Menyiapkan Pembayaran..." : buttonLabel}</span>
      </button>

      {error && (
        <p className="text-[11px] font-medium text-rose-600 leading-snug max-w-xs">
          {error}
        </p>
      )}
    </div>
  );
}
