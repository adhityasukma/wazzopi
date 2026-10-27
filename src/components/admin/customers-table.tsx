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
  Loader2,
  MinusSquare,
  Square,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import { formatCurrency, type CurrencySettings } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import {
  deleteCustomer,
  deleteSelectedCustomers,
  deleteAllCustomers,
} from "@/actions/customers";

type CustomerItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  province: string | null;
  createdAt: string | Date;
  orders: {
    total: number;
    status: string;
  }[];
};

type Props = {
  customers: CustomerItem[];
  currency: CurrencySettings;
  totalMatching: number;
  totalAllCustomers: number;
  currentPage: number;
  totalPages: number;
  pageSize: number | null; // null jika "all"
  currentLimit: string; // "20" | "50" | "100" | "all"
  searchQuery?: string;
};

export function CustomersTable({
  customers,
  currency,
  totalMatching,
  totalAllCustomers,
  currentPage,
  totalPages,
  pageSize,
  currentLimit,
  searchQuery = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Dialog state
  const [modalMode, setModalMode] = useState<"single" | "selected" | "all" | null>(null);
  const [singleTarget, setSingleTarget] = useState<CustomerItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const allVisibleIds = customers.map((c) => c.id);
  const isAllSelected =
    customers.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    selectedIds.length > 0 && !isAllSelected;

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

  function openSingleDelete(customer: CustomerItem) {
    setSingleTarget(customer);
    setModalMode("single");
  }

  function openSelectedDelete() {
    if (selectedIds.length === 0) return;
    setModalMode("selected");
  }

  function openDeleteAll() {
    if (totalAllCustomers === 0) return;
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
          const res = await deleteCustomer(singleTarget.id);
          if (!res.success) throw new Error(res.error);

          setSelectedIds((prev) => prev.filter((id) => id !== singleTarget.id));
          setFeedback({
            type: "success",
            message: `Pelanggan "${singleTarget.name}" berhasil dihapus.`,
          });
        } else if (modalMode === "selected") {
          const res = await deleteSelectedCustomers(selectedIds);
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? selectedIds.length;
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: `${deletedCount} pelanggan terpilih berhasil dihapus.`,
          });
        } else if (modalMode === "all") {
          const res = await deleteAllCustomers();
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? totalAllCustomers;
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: `Seluruh data pelanggan (${deletedCount} akun) berhasil dihapus.`,
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
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </span>
        ) : (
          <Link
            href={getPageUrl(currentPage - 1)}
            data-loading-message={`Memuat pelanggan halaman ${currentPage - 1}...`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-600 hover:bg-latte/50 transition"
            title="Halaman Sebelumnya"
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
              data-loading-message={`Memuat pelanggan halaman ${p}...`}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-latte bg-white px-2 text-xs font-semibold text-espresso-700 hover:bg-latte/50 transition"
            >
              {p}
            </Link>
          );
        })}

        {currentPage >= totalPages ? (
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-300 opacity-50 cursor-not-allowed"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </span>
        ) : (
          <Link
            href={getPageUrl(currentPage + 1)}
            data-loading-message={`Memuat pelanggan halaman ${currentPage + 1}...`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-600 hover:bg-latte/50 transition"
            title="Halaman Selanjutnya"
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
              {selectedIds.length} pelanggan dipilih
            </span>
          ) : (
            <span className="text-xs font-medium text-espresso-600">
              {totalMatching === 0
                ? "Tidak ada pelanggan ditemukan"
                : pageSize
                ? `Menampilkan ${startIndex} - ${endIndex} dari ${totalMatching} pelanggan`
                : `Menampilkan semua ${totalMatching} pelanggan`}
              {totalAllCustomers !== totalMatching && ` (total ${totalAllCustomers} di sistem)`}
              {searchQuery && ` (filter: "${searchQuery}")`}
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
                    data-loading-message={`Menampilkan ${opt === "all" ? "semua" : opt} pelanggan per halaman...`}
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
                Hapus Terpilih ({selectedIds.length})
              </button>
            )}

            {/* Tombol Delete ALL */}
            {totalAllCustomers > 0 && (
              <button
                type="button"
                onClick={openDeleteAll}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50/60 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 hover:border-rose-400 active:scale-95"
              >
                <UserX className="h-4 w-4 text-rose-600" />
                Hapus Semua Pelanggan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Data Customers */}
      <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-espresso-50/70 text-xs uppercase text-espresso-500">
              <tr>
                <th className="w-12 px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    disabled={customers.length === 0}
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
                <th className="px-4 py-3">Nama Pelanggan</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Kota & Alamat</th>
                <th className="px-4 py-3 text-center">Total Pesanan</th>
                <th className="px-4 py-3">Total Belanja (LTV)</th>
                <th className="px-4 py-3">Terdaftar Sejak</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-espresso-400">
                    Tidak ada data pelanggan yang sesuai.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  const totalSpent = c.orders.reduce((sum, o) => sum + o.total, 0);

                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        isSelected ? "bg-caramel-50/60" : "hover:bg-cream/40"
                      }`}
                    >
                      <td className="w-12 px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(c.id)}
                          className="flex items-center justify-center text-espresso-600 hover:text-caramel-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-caramel-600" />
                          ) : (
                            <Square className="h-4 w-4 text-espresso-300" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-semibold text-espresso-900">
                        {c.name}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <p className="font-medium text-espresso-800">{c.email}</p>
                        <p className="text-espresso-400">{c.phone || "-"}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-espresso-600">
                        {c.city ? `${c.city}, ${c.province || ""}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex rounded-full bg-latte px-2.5 py-0.5 text-xs font-semibold text-espresso-800">
                          {c.orders.length} pesanan
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-espresso-900">
                        {formatCurrency(totalSpent, currency)}
                      </td>
                      <td className="px-4 py-3 text-xs text-espresso-400">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => openSingleDelete(c)}
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50"
                          title={`Hapus pelanggan ${c.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
                <strong className="text-espresso-900">{totalPages}</strong> ({totalMatching} pelanggan)
              </>
            ) : (
              <>Semua {totalMatching} pelanggan ditampilkan dalam 1 halaman</>
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
                  {modalMode === "single" && "Hapus Pelanggan"}
                  {modalMode === "selected" && "Hapus Pelanggan Terpilih"}
                  {modalMode === "all" && "Hapus Seluruh Pelanggan (Delete ALL)"}
                </h3>
                <p className="mt-1.5 text-xs text-espresso-600 leading-relaxed">
                  {modalMode === "single" && singleTarget && (
                    <>
                      Apakah Anda yakin ingin menghapus data pelanggan{" "}
                      <strong className="text-espresso-900">{singleTarget.name}</strong> (
                      {singleTarget.email})?
                    </>
                  )}
                  {modalMode === "selected" && (
                    <>
                      Anda akan menghapus{" "}
                      <strong className="text-espresso-900">
                        {selectedIds.length} pelanggan
                      </strong>{" "}
                      yang sedang dipilih.
                    </>
                  )}
                  {modalMode === "all" && (
                    <>
                      Anda akan menghapus{" "}
                      <strong className="text-rose-700">
                        SELURUH ({totalAllCustomers}) akun pelanggan
                      </strong>{" "}
                      yang terdaftar di sistem. Akun staf Administrator dan Karyawan tidak
                      akan dihapus.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Catatan Info */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="leading-relaxed">
                Tindakan ini <strong>tidak dapat dibatalkan</strong>. Riwayat pesanan yang pernah
                dibuat pelanggan tetap aman tersimpan dalam database laporan sebagai pesanan tamu.
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
                    {modalMode === "single" && "Ya, Hapus Pelanggan"}
                    {modalMode === "selected" && `Hapus ${selectedIds.length} Pelanggan`}
                    {modalMode === "all" && `Ya, Hapus Semua (${totalAllCustomers})`}
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
