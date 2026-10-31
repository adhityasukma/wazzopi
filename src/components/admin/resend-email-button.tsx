"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { resendOrderEmail } from "@/actions/orders";
import { useI18n } from "@/i18n/provider";

export function ResendEmailButton({
  orderId,
  customerEmail,
  className = "",
}: {
  orderId: string;
  customerEmail: string;
  className?: string;
}) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleResend = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = await resendOrderEmail(orderId);
      if (res.success) {
        setStatus({ type: "success", text: res.message });
      } else {
        setStatus({ type: "error", text: res.message });
      }
    } catch (err: any) {
      setStatus({ type: "error", text: err.message || (isEn ? "Failed to connect to server" : "Gagal menghubungi server") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col gap-1.5">
      <button
        type="button"
        onClick={handleResend}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-espresso-200 bg-white px-3 py-1.5 text-xs font-semibold text-espresso-700 shadow-xs hover:bg-cream hover:text-espresso-950 disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-caramel-600" />
            <span>{isEn ? "Sending..." : "Sedang Mengirim..."}</span>
          </>
        ) : (
          <>
            <Mail className="h-3.5 w-3.5 text-caramel-600" />
            <span>{isEn ? "Resend Status Email" : "Kirim Ulang Email Status"}</span>
          </>
        )}
      </button>

      {status && (
        <div
          className={`flex items-start gap-1.5 rounded-md p-2 text-[11px] leading-tight ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600 mt-0.5" />
          )}
          <span className="break-all">{status.text}</span>
        </div>
      )}
    </div>
  );
}
