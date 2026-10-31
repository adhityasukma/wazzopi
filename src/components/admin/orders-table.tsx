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
  Truck,
  X,
} from "lucide-react";
import { formatCurrency, type CurrencySettings } from "@/lib/currency";
import {
  formatDate,
  getOrderStatusLabel,
  ORDER_STATUS_STYLE,
  getPaymentLabel,
} from "@/lib/utils";
import { useI18n } from "@/i18n/provider";
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
  trackingNumber?: string | null;
  courierName?: string | null;
  courierCode?: string | null;
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
  const { locale } = useI18n();
  const isEn = locale === "en";

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
            message: isEn
              ? `Order "${singleTarget.orderNo}" deleted successfully.`
              : `Pesanan "${singleTarget.orderNo}" berhasil dihapus.`,
          });
        } else if (modalMode === "selected") {
          const res = await deleteSelectedOrders(selectedIds);
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? selectedIds.length;
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: isEn
              ? `${deletedCount} selected orders deleted successfully.`
              : `${deletedCount} pesanan terpilih berhasil dihapus.`,
          });
        } else if (modalMode === "all") {
          const res = await deleteAllOrders();
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? totalAllOrders;
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: isEn
              ? `All orders (${deletedCount} orders) deleted successfully.`
              : `Seluruh pesanan (${deletedCount} pesanan) berhasil dihapus.`,
          });
        }

        setModalMode(null);
        setSingleTarget(null);
        router.refresh();
      } catch (err: any) {
        setFeedback({
          type: "error",
          message: err.message || (isEn ? "An error occurred while deleting." : "Terjadi kesalahan saat memproses penghapusan."),
        });
      }
    });
  }

  // URL generator untuk limit data dan pagination
  function getLimitUrl(newLimit: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page"); // Reset ke halaman 1 saat mengubah batas per halaman
    if (newLimit === "20") {
      params.delete("limit");
    } else {
      params.set("limit", newLimit);
    }
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }

  function getPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
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
        {currentPage <= 1 ? (
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-300 opacity-50 cursor-not-allowed"
            title={isEn ? "Previous Page" : "Halaman Sebelumnya"}
          >
            <ChevronLeft className="h-4 w-4" />
          </span>
        ) : (
          <Link
            href={getPageUrl(currentPage - 1)}
            data-loading-message={isEn ? `Loading orders page ${currentPage - 1}...` : `Memuat pesanan halaman ${currentPage - 1}...`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-600 hover:bg-latte/50 transition"
            title={isEn ? "Previous Page" : "Halaman Sebelumnya"}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
        )}

        {pages.map((p, idx) => {
          if (typeof p !== "number") {
            return (
              <span
                key={idx}
                className="inline-flex h-8 w-8 items-center justify-center text-xs text-espresso-400 select-none"
              >
                ...
              </span>
            );
          }

          if (currentPage === p) {
            return (
              <span
                key={idx}
                className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold bg-espresso-700 text-cream shadow-xs cursor-default"
              >
                {p}
              </span>
            );
          }

          return (
            <Link
              key={idx}
              href={getPageUrl(p)}
              data-loading-message={isEn ? `Loading orders page ${p}...` : `Memuat pesanan halaman ${p}...`}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-latte bg-white px-2 text-xs font-semibold text-espresso-700 hover:bg-latte/50 transition"
            >
              {p}
            </Link>
          );
        })}

        {currentPage >= totalPages ? (
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-300 opacity-50 cursor-not-allowed"
            title={isEn ? "Next Page" : "Halaman Selanjutnya"}
          >
            <ChevronRight className="h-4 w-4" />
          </span>
        ) : (
          <Link
            href={getPageUrl(currentPage + 1)}
            data-loading-message={isEn ? `Loading orders page ${currentPage + 1}...` : `Memuat pesanan halaman ${currentPage + 1}...`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-600 hover:bg-latte/50 transition"
            title={isEn ? "Next Page" : "Halaman Selanjutnya"}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
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
              {isEn ? `${selectedIds.length} orders selected` : `${selectedIds.length} pesanan dipilih`}
            </span>
          ) : (
            <span className="text-xs font-medium text-espresso-600">
              {totalMatching === 0
                ? (isEn ? "No orders found" : "Tidak ada pesanan ditemukan")
                : pageSize
                ? (isEn
                    ? `Showing ${startIndex} - ${endIndex} of ${totalMatching} orders`
                    : `Menampilkan ${startIndex} - ${endIndex} dari ${totalMatching} pesanan`)
                : (isEn
                    ? `Showing all ${totalMatching} orders`
                    : `Menampilkan semua ${totalMatching} pesanan`)}
              {totalAllOrders !== totalMatching && (isEn ? ` (total ${totalAllOrders} in system)` : ` (total ${totalAllOrders} di sistem)`)}
            </span>
          )}

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-espresso-500 hover:bg-latte/50 hover:text-espresso-800"
            >
              {isEn ? "Deselect All" : "Batalkan Pilihan"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Show Data Selector (20, 50, 100, All) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-espresso-500">{isEn ? "Show:" : "Tampilkan:"}</span>
            <div className="inline-flex rounded-lg border border-latte bg-latte/30 p-0.5 text-xs">
              {(["20", "50", "100", "all"] as const).map((opt) => {
                const isActive = currentLimit === opt;
                const label = opt === "all" ? "All" : opt;

                if (isActive) {
                  return (
                    <span
                      key={opt}
                      className="rounded-md bg-white px-2.5 py-1 font-semibold text-espresso-900 shadow-xs cursor-default"
                    >
                      {label}
                    </span>
                  );
                }

                return (
                  <Link
                    key={opt}
                    href={getLimitUrl(opt)}
                    data-loading-message={isEn ? `Showing ${opt === "all" ? "all" : opt} orders per page...` : `Menampilkan ${opt === "all" ? "semua" : opt} pesanan per halaman...`}
                    className="rounded-md px-2.5 py-1 font-semibold text-espresso-600 hover:text-espresso-900 transition"
                  >
                    {label}
                  </Link>
                );
              })}
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
                {isEn ? `Delete Selected (${selectedIds.length})` : `Hapus Terpilih (${selectedIds.length})`}
              </button>
            )}

            {/* Tombol Delete ALL */}
            {totalAllOrders > 0 && (
              <button
                type="button"
                onClick={openDeleteAll}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50/60 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 hover:border-rose-400 active:scale-95"
                title={isEn ? "Delete All Orders" : "Hapus Seluruh Pesanan"}
              >
                <Trash2 className="h-4 w-4 text-rose-600" />
                {isEn ? "Delete All Orders" : "Hapus Semua Pesanan"}
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
                    title={
                      isAllSelected
                        ? (isEn ? "Deselect all on this page" : "Batalkan semua pilihan")
                        : (isEn ? "Select all on this page" : "Pilih semua di halaman ini")
                    }
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
                <th className="px-4 py-3">{isEn ? "ORDER NO." : "NO. PESANAN"}</th>
                <th className="px-4 py-3">{isEn ? "CUSTOMER" : "PELANGGAN"}</th>
                <th className="px-4 py-3">{isEn ? "DATE" : "TANGGAL"}</th>
                <th className="px-4 py-3">{isEn ? "SHIPPING & PAYMENT" : "PENGIRIMAN & BAYAR"}</th>
                <th className="px-4 py-3">{isEn ? "ITEMS" : "ITEM PRODUK"}</th>
                <th className="px-4 py-3">{isEn ? "TOTAL AMOUNT" : "TOTAL TAGIHAN"}</th>
                <th className="px-4 py-3">{isEn ? "STATUS" : "STATUS"}</th>
                <th className="px-4 py-3 text-right">{isEn ? "ACTIONS" : "AKSI"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-espresso-400">
                    {isEn ? "No order transactions found." : "Tidak ada transaksi pesanan yang sesuai."}
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
                        {formatDate(o.createdAt, true, locale)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-medium text-espresso-800">{o.shippingMethod}</p>
                        <p className="text-espresso-400">
                          {getPaymentLabel(o.paymentMethod, locale)}
                        </p>
                        {o.trackingNumber && (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] text-caramel-700 bg-caramel-50 px-1.5 py-0.5 rounded border border-caramel-200 mt-1">
                            <Truck className="h-2.5 w-2.5 text-caramel-600" />
                            {o.trackingNumber}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-espresso-600">
                        {o.items.length} {isEn ? (o.items.length === 1 ? "item" : "items") : "item"} (
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
                          {getOrderStatusLabel(o.status, locale)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-espresso-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-espresso-700 hover:bg-latte shadow-xs transition"
                          >
                            <Eye className="h-3.5 w-3.5 text-espresso-400" />
                            {isEn ? "Manage" : "Kelola"}
                          </Link>
                          <button
                            type="button"
                            onClick={() => openSingleDelete(o)}
                            className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
                            title={isEn ? `Delete order ${o.orderNo}` : `Hapus pesanan ${o.orderNo}`}
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
                {isEn ? "Page" : "Halaman"} <strong className="text-espresso-900">{currentPage}</strong> {isEn ? "of" : "dari"}{" "}
                <strong className="text-espresso-900">{totalPages}</strong> ({totalMatching} {isEn ? "orders" : "pesanan"})
              </>
            ) : (
              <>{isEn ? `All ${totalMatching} orders shown on 1 page` : `Semua ${totalMatching} pesanan ditampilkan dalam 1 halaman`}</>
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
                  {modalMode === "single" && (isEn ? "Delete Order" : "Hapus Pesanan")}
                  {modalMode === "selected" && (isEn ? "Delete Selected Orders" : "Hapus Pesanan Terpilih")}
                  {modalMode === "all" && (isEn ? "Delete ALL Orders (Clear All)" : "Hapus Seluruh Pesanan (Delete ALL)")}
                </h3>
                <p className="mt-1.5 text-xs text-espresso-600 leading-relaxed">
                  {modalMode === "single" && singleTarget && (
                    <>
                      {isEn ? "Are you sure you want to delete order transaction number " : "Apakah Anda yakin ingin menghapus transaksi pesanan nomor "}
                      <strong className="text-espresso-900 font-mono">
                        {singleTarget.orderNo}
                      </strong>{" "}
                      {isEn ? "for " : "atas nama "}<strong>{singleTarget.customerName}</strong>?
                    </>
                  )}
                  {modalMode === "selected" && (
                    <>
                      {isEn ? "You are about to delete " : "Anda akan menghapus "}
                      <strong className="text-espresso-900">
                        {selectedIds.length} {isEn ? "orders" : "pesanan"}
                      </strong>{" "}
                      {isEn ? "currently selected." : "yang sedang dipilih."}
                    </>
                  )}
                  {modalMode === "all" && (
                    <>
                      {isEn ? "You are about to delete " : "Anda akan menghapus "}
                      <strong className="text-rose-700">
                        {isEn ? `ALL (${totalAllOrders}) order transactions` : `SELURUH (${totalAllOrders}) data transaksi pesanan`}
                      </strong>{" "}
                      {isEn ? "in the store system." : "yang ada di sistem toko."}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Catatan Info */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="leading-relaxed">
                {isEn ? <>This action <strong>cannot be undone</strong>. Product details and transaction records will be permanently removed from the database.</> : <>Tindakan ini <strong>tidak dapat dibatalkan</strong>. Rincian produk dan data transaksi yang dihapus akan terhapus secara permanen dari basis data.</>}
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
                    {isEn ? "Processing..." : "Memproses..."}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {modalMode === "single" && (isEn ? "Yes, Delete Order" : "Ya, Hapus Pesanan")}
                    {modalMode === "selected" && (isEn ? `Delete ${selectedIds.length} Orders` : `Hapus ${selectedIds.length} Pesanan`)}
                    {modalMode === "all" && (isEn ? `Yes, Delete All (${totalAllOrders})` : `Ya, Hapus Semua (${totalAllOrders})`)}
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
