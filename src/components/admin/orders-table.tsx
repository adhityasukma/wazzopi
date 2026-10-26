"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MinusSquare,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { formatCurrency, type CurrencySettings } from "@/lib/currency";
import {
  formatDate,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  PAYMENT_LABEL,
} from "@/lib/utils";
import {
  deleteOrder,
  deleteSelectedOrders,
  deleteAllOrders,
} from "@/actions/orders";

export type OrderRow = {
  id: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  createdAt: string | Date;
  shippingMethod: string;
  paymentMethod: string;
  items: {
    id: string;
    productName: string;
  }[];
  total: number;
  status: string;
};

type Props = {
  orders: OrderRow[];
  currency: CurrencySettings;
  totalMatching: number;
  totalAllOrders: number;
  currentPage: number;
  totalPages: number;
  pageSize: number | null; // null jika "all"
  currentLimit: string; // "20" | "50" | "100" | "all"
  currentStatus?: string;
  searchQuery?: string;
};

export function OrdersTable({
  orders,
  currency,
  totalMatching,
  totalAllOrders,
  currentPage,
  totalPages,
  pageSize,
  currentLimit,
  currentStatus,
  searchQuery = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Dialog state
  const [modalMode, setModalMode] = useState<"single" | "selected" | "all" | null>(null);
  const [singleTarget, setSingleTarget] = useState<OrderRow | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const allVisibleIds = orders.map((o) => o.id);
  const isAllSelected =
    orders.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allVisibleIds);
    }
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function openSingleDelete(order: OrderRow) {
    setSingleTarget(order);
    setModalMode("single");
  }

  function openSelectedDelete() {
    if (selectedIds.length === 0) return;
    setModalMode("selected");
  }

  function openDeleteAll() {
    if (totalAllOrders === 0) return;
    setModalMode("all");
  }

  function closeModal() {
    if (isPending) return;
    setModalMode(null);
    setSingleTarget(null);
  }

  function handleConfirmDelete() {
    setFeedback(null);

    startTransition(async () => {
      try {
        if (modalMode === "single" && singleTarget) {
          const res = await deleteOrder(singleTarget.id);
          if (!res.success) throw new Error(res.error);

          setSelectedIds((prev) => prev.filter((id) => id !== singleTarget.id));
          setFeedback({
            type: "success",
            message: `Pesanan "${singleTarget.orderNo}" berhasil dihapus.`,
          });
        } else if (modalMode === "selected") {
          const res = await deleteSelectedOrders(selectedIds);
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? selectedIds.length;
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: `${deletedCount} pesanan terpilih berhasil dihapus.`,
          });
        } else if (modalMode === "all") {
          const res = await deleteAllOrders();
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? totalAllOrders;
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: `Seluruh pesanan (${deletedCount} pesanan) berhasil dihapus.`,
          });
        }

        setModalMode(null);
        setSingleTarget(null);
        router.refresh();
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err.message || "Terjadi kesalahan saat memproses penghapusan.",
        });
      }
    });
  }

  // Navigasi URL untuk limit dan pagination
  function changeLimit(newLimit: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset ke halaman 1 saat mengubah limit
    if (newLimit === "20") {
      params.delete("limit");
    } else {
      params.set("limit", newLimit);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  // Hitung rentang data yang sedang ditampilkan
  const startIndex = pageSize ? (currentPage - 1) * pageSize + 1 : 1;
  const endIndex = pageSize ? Math.min(currentPage * pageSize, totalMatching) : totalMatching;

  // Render nomor halaman dengan elipsis jika halaman banyak
  function renderPaginationButtons() {
    if (totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-600 hover:bg-latte/50 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              type="button"
              onClick={() => goToPage(p)}
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                currentPage === p
                  ? "bg-espresso-700 text-cream shadow-xs"
                  : "border border-latte bg-white text-espresso-700 hover:bg-latte/50"
              }`}
            >
              {p}
            </button>
          ) : (
            <span
              key={idx}
              className="inline-flex h-8 w-8 items-center justify-center text-xs text-espresso-400 select-none"
            >
              ...
            </span>
          )
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-600 hover:bg-latte/50 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-4 text-sm font-medium transition-all ${
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <Check className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="rounded-lg p-1 text-espresso-400 hover:text-espresso-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toolbar Atas: Aksi Massal & Show Data */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-latte bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {selectedIds.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-caramel-100 px-3 py-1.5 text-xs font-bold text-caramel-900">
              <CheckSquare className="h-4 w-4 text-caramel-700" />
              {selectedIds.length} pesanan dipilih
            </span>
          ) : (
            <span className="text-xs font-medium text-espresso-600">
              {totalMatching === 0
                ? "Tidak ada pesanan ditemukan"
                : pageSize
                ? `Menampilkan ${startIndex} - ${endIndex} dari ${totalMatching} pesanan`
                : `Menampilkan semua ${totalMatching} pesanan`}
              {totalAllOrders !== totalMatching && ` (total ${totalAllOrders} di sistem)`}
            </span>
          )}

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-espresso-500 hover:bg-latte/50 hover:text-espresso-800"
            >
              Batalkan Pilihan
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Show Data Selector (20, 50, 100, All) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-espresso-500">Tampilkan:</span>
            <div className="inline-flex rounded-lg border border-latte bg-latte/30 p-0.5 text-xs">
              {(["20", "50", "100", "all"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => changeLimit(opt)}
                  className={`rounded-md px-2.5 py-1 font-semibold transition ${
                    currentLimit === opt
                      ? "bg-white text-espresso-900 shadow-xs"
                      : "text-espresso-600 hover:text-espresso-900"
                  }`}
                >
                  {opt === "all" ? "All" : opt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-latte pl-3">
            {/* Tombol Bulk Delete Selected */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={openSelectedDelete}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                Hapus Terpilih ({selectedIds.length})
              </button>
            )}

            {/* Tombol Delete ALL */}
            {totalAllOrders > 0 && (
              <button
                type="button"
                onClick={openDeleteAll}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50/60 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 hover:border-rose-400 active:scale-95"
                title="Hapus Seluruh Pesanan"
              >
                <Trash2 className="h-4 w-4 text-rose-600" />
                Hapus Semua Pesanan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Pesanan */}
      <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-espresso-50/70 text-xs uppercase text-espresso-500">
              <tr>
                <th className="w-12 px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    disabled={orders.length === 0}
                    className="flex items-center justify-center text-espresso-600 hover:text-caramel-600 disabled:opacity-40"
                    title={isAllSelected ? "Batalkan semua pilihan" : "Pilih semua di halaman ini"}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-4 w-4 text-caramel-600" />
                    ) : isSomeSelected ? (
                      <MinusSquare className="h-4 w-4 text-caramel-600" />
                    ) : (
                      <Square className="h-4 w-4 text-espresso-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">No. Pesanan</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Pengiriman & Bayar</th>
                <th className="px-4 py-3">Item Produk</th>
                <th className="px-4 py-3">Total Tagihan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-espresso-400">
                    Tidak ada transaksi pesanan yang sesuai.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const isSelected = selectedIds.includes(o.id);

                  return (
                    <tr
                      key={o.id}
                      className={`transition-colors ${
                        isSelected ? "bg-caramel-50/60" : "hover:bg-cream/40"
                      }`}
                    >
                      <td className="w-12 px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(o.id)}
                          className="flex items-center justify-center text-espresso-600 hover:text-caramel-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-caramel-600" />
                          ) : (
                            <Square className="h-4 w-4 text-espresso-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-espresso-900">
                        {o.orderNo}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-espresso-900">{o.customerName}</p>
                        <p className="text-xs text-espresso-400">{o.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-espresso-500">
                        {formatDate(o.createdAt, true)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-medium text-espresso-800">{o.shippingMethod}</p>
                        <p className="text-espresso-400">
                          {PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-espresso-600">
                        {o.items.length} item (
                        {o.items.map((i) => i.productName).slice(0, 2).join(", ")}
                        {o.items.length > 2 ? "..." : ""})
                      </td>
                      <td className="px-4 py-3 font-semibold text-espresso-900">
                        {formatCurrency(o.total, currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            ORDER_STATUS_STYLE[o.status] || "bg-latte text-espresso-800"
                          }`}
                        >
                          {ORDER_STATUS_LABEL[o.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-espresso-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-espresso-700 hover:bg-latte shadow-xs transition"
                          >
                            <Eye className="h-3.5 w-3.5 text-espresso-400" />
                            Kelola
                          </Link>
                          <button
                            type="button"
                            onClick={() => openSingleDelete(o)}
                            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
                            title={`Hapus pesanan ${o.orderNo}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Tabel: Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-latte bg-espresso-50/30 px-4 py-3">
          <div className="text-xs text-espresso-500">
            {pageSize ? (
              <>
                Halaman <strong className="text-espresso-900">{currentPage}</strong> dari{" "}
                <strong className="text-espresso-900">{totalPages}</strong> ({totalMatching} pesanan)
              </>
            ) : (
              <>Semua {totalMatching} pesanan ditampilkan dalam 1 halaman</>
            )}
          </div>

          <div>{renderPaginationButtons()}</div>
        </div>
      </div>

      {/* Modal Dialog Konfirmasi Penghapusan */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-latte bg-white p-6 shadow-2xl">
            {/* Header Modal */}
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  modalMode === "all"
                    ? "bg-rose-600 text-white"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-espresso-900">
                  {modalMode === "single" && "Hapus Pesanan"}
                  {modalMode === "selected" && "Hapus Pesanan Terpilih"}
                  {modalMode === "all" && "Hapus Seluruh Pesanan (Delete ALL)"}
                </h3>
                <p className="mt-1.5 text-xs text-espresso-600 leading-relaxed">
                  {modalMode === "single" && singleTarget && (
                    <>
                      Apakah Anda yakin ingin menghapus transaksi pesanan nomor{" "}
                      <strong className="text-espresso-900 font-mono">
                        {singleTarget.orderNo}
                      </strong>{" "}
                      atas nama <strong>{singleTarget.customerName}</strong>?
                    </>
                  )}
                  {modalMode === "selected" && (
                    <>
                      Anda akan menghapus{" "}
                      <strong className="text-espresso-900">
                        {selectedIds.length} pesanan
                      </strong>{" "}
                      yang sedang dipilih.
                    </>
                  )}
                  {modalMode === "all" && (
                    <>
                      Anda akan menghapus{" "}
                      <strong className="text-rose-700">
                        SELURUH ({totalAllOrders}) data transaksi pesanan
                      </strong>{" "}
                      yang ada di sistem toko.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Catatan Info */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="leading-relaxed">
                Tindakan ini <strong>tidak dapat dibatalkan</strong>. Rincian produk dan data
                transaksi yang dihapus akan terhapus secara permanen dari basis data.
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={closeModal}
                className="cursor-pointer rounded-lg border border-espresso-200 bg-white px-4 py-2 text-xs font-semibold text-espresso-700 hover:bg-espresso-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirmDelete}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {modalMode === "single" && "Ya, Hapus Pesanan"}
                    {modalMode === "selected" && `Hapus ${selectedIds.length} Pesanan`}
                    {modalMode === "all" && `Ya, Hapus Semua (${totalAllOrders})`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
