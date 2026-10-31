"use client";

import { useState, useTransition, useEffect } from "react";
import { Check, Loader2, AlertCircle, Mail } from "lucide-react";
import { updateOrderStatus } from "@/actions/orders";
import { useI18n } from "@/i18n/provider";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  getOrderStatusLabel,
  ORDER_STATUS_STYLE,
  type OrderStatus,
} from "@/lib/utils";

export function OrderStatusForm({
  orderId,
  currentStatus,
  customerEmail,
}: {
  orderId: string;
  currentStatus: string;
  customerEmail?: string | null;
}) {
  const { locale } = useI18n();
  const isEn = locale === "en";
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [activeStatus, setActiveStatus] = useState(currentStatus);
  const [sendEmail, setSendEmail] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setActiveStatus(currentStatus);
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.set("id", orderId);
    formData.set("status", selectedStatus);
    formData.set("sendEmail", sendEmail ? "true" : "false");

    startTransition(async () => {
      try {
        const res = await updateOrderStatus(formData);
        if (res?.success) {
          setActiveStatus(selectedStatus);
          setMessage({
            type: "success",
            text:
              res?.message ||
              (isEn
                ? `Order status successfully updated to ${getOrderStatusLabel(selectedStatus as OrderStatus, locale)}.`
                : `Status pesanan berhasil diperbarui menjadi ${getOrderStatusLabel(selectedStatus as OrderStatus, locale)}.`),
          });
        } else {
          setMessage({
            type: "error",
            text: res?.error || (isEn ? "Failed to update order status." : "Gagal memperbarui status pesanan."),
          });
        }
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err?.message || (isEn ? "An error occurred while saving status." : "Terjadi kesalahan saat menyimpan status."),
        });
      }
    });
  };

  return (
    <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
      <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
        {isEn ? "Update Order Status" : "Ubah Status Pesanan"}
      </h2>

      <div className="mt-4 space-y-4">
        {/* Status Aktif */}
        <div className="flex items-center justify-between rounded-lg bg-latte/30 p-3 border border-latte">
          <span className="text-xs font-semibold text-espresso-600">{isEn ? "Current Status:" : "Status Saat Ini:"}</span>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              ORDER_STATUS_STYLE[activeStatus] || "bg-latte text-espresso-800"
            }`}
          >
            {getOrderStatusLabel(activeStatus as OrderStatus, locale)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-espresso-600 block mb-1.5">
              {isEn ? "Select New Status" : "Pilih Status Baru"}
            </label>
            <select
              name="status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setMessage(null);
              }}
              className="w-full rounded-lg border border-espresso-200 bg-white p-2.5 text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-caramel-500"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {getOrderStatusLabel(st, locale)}
                </option>
              ))}
            </select>
          </div>

          {/* Opsi Kirim Notifikasi Email */}
          <div className="rounded-lg border border-latte bg-espresso-50/40 p-3">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 mt-0.5 cursor-pointer accent-caramel-600"
              />
              <div className="text-xs">
                <span className="font-semibold text-espresso-900 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-caramel-600" />
                  {isEn ? "Send notification email to customer" : "Kirim email notifikasi ke pembeli"}
                </span>
                <span className="text-[11px] text-espresso-500 block mt-0.5 leading-relaxed">
                  {sendEmail
                    ? customerEmail
                      ? isEn
                        ? `Status update email will be sent to ${customerEmail}`
                        : `Email pembaruan status akan dikirimkan ke ${customerEmail}`
                      : isEn
                      ? "Order status notification email will be sent to customer"
                      : "Email notifikasi pembaruan status akan dikirimkan ke pembeli"
                    : isEn
                    ? "Only update status in internal shop system (no email sent)"
                    : "Hanya perbarui status di sistem internal toko (tanpa kirim email)"}
                </span>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending || selectedStatus === activeStatus}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${
              sendEmail
                ? "bg-espresso-800 text-white hover:bg-espresso-900"
                : "bg-espresso-100 text-espresso-800 border border-espresso-300 hover:bg-espresso-200"
            }`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{isEn ? "Saving Changes..." : "Menyimpan Perubahan..."}</span>
              </>
            ) : sendEmail ? (
              <span>{isEn ? "Save & Send Notification Email" : "Simpan & Kirim Email Notifikasi"}</span>
            ) : (
              <span>{isEn ? "Save Status Only (No Email)" : "Simpan Status Saja (Tanpa Email)"}</span>
            )}
          </button>
        </form>

        {message && (
          <div
            className={`flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
