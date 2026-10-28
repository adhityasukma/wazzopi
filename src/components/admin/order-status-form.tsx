"use client";

import { useState, useTransition, useEffect } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { updateOrderStatus } from "@/actions/orders";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  type OrderStatus,
} from "@/lib/utils";

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [activeStatus, setActiveStatus] = useState(currentStatus);
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

    startTransition(async () => {
      try {
        const res = await updateOrderStatus(formData);
        if (res?.success) {
          setActiveStatus(selectedStatus);
          setMessage({
            type: "success",
            text: `Status pesanan berhasil diperbarui menjadi ${
              ORDER_STATUS_LABEL[selectedStatus as OrderStatus] || selectedStatus
            }.`,
          });
        } else {
          setMessage({
            type: "error",
            text: res?.error || "Gagal memperbarui status pesanan.",
          });
        }
      } catch (err: any) {
        setMessage({
          type: "error",
          text: err?.message || "Terjadi kesalahan saat menyimpan status.",
        });
      }
    });
  };

  return (
    <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
      <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
        Ubah Status Pesanan
      </h2>

      <div className="mt-4 space-y-4">
        {/* Status Aktif */}
        <div className="flex items-center justify-between rounded-lg bg-latte/30 p-3 border border-latte">
          <span className="text-xs font-semibold text-espresso-600">Status Saat Ini:</span>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              ORDER_STATUS_STYLE[activeStatus] || "bg-latte text-espresso-800"
            }`}
          >
            {ORDER_STATUS_LABEL[activeStatus as OrderStatus] || activeStatus}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-espresso-600 block mb-1.5">
              Pilih Status Baru
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
                  {ORDER_STATUS_LABEL[st]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending || selectedStatus === activeStatus}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-espresso-700 py-2.5 text-xs font-semibold text-cream hover:bg-espresso-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <span>Simpan Perubahan Status</span>
            )}
          </button>
        </form>

        {message && (
          <div
            className={`flex items-start gap-2 rounded-lg p-3 text-xs ${
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
