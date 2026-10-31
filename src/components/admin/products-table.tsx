"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  MinusSquare,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { formatCurrency, type CurrencySettings } from "@/lib/currency";
import { useI18n } from "@/i18n/provider";
import { getLocalizedCategoryName } from "@/lib/category-i18n";
import {
  deleteSingleProduct,
  deleteSelectedProducts,
  deleteAllProducts,
} from "@/actions/products";

export type ProductRow = {
  id: string;
  name: string;
  sku: string | null;
  image: string | null;
  price: number;
  stock: number;
  status: string;
  hasVariants: boolean;
  category: { id: string; name: string } | null;
  variants: { id: string; name: string; stock: number; price: number }[];
};

type Props = {
  products: ProductRow[];
  currency: CurrencySettings;
  totalMatching: number;
  totalAllProducts: number;
  currentPage: number;
  totalPages: number;
  pageSize: number | null; // null jika "all"
  currentLimit: string; // "20" | "50" | "100" | "all"
  currentCategory?: string;
  searchQuery?: string;
  isAdmin: boolean;
};

export function ProductsTable({
  products,
  currency,
  totalMatching,
  totalAllProducts,
  currentPage,
  totalPages,
  pageSize,
  currentLimit,
  searchQuery = "",
  isAdmin,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale } = useI18n();
  const isEn = locale === "en";

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [modalMode, setModalMode] = useState<"single" | "selected" | "all" | null>(null);
  const [singleTarget, setSingleTarget] = useState<ProductRow | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const allVisibleIds = products.map((p) => p.id);
  const isAllSelected =
    products.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
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

  function openSingleDelete(prod: ProductRow) {
    setSingleTarget(prod);
    setModalMode("single");
  }

  function openSelectedDelete() {
    if (selectedIds.length === 0) return;
    setModalMode("selected");
  }

  function openDeleteAll() {
    if (totalAllProducts === 0) return;
    setModalMode("all");
  }

  function closeModal() {
    if (isDeleting) return;
    setModalMode(null);
    setSingleTarget(null);
  }

  function handleConfirmDelete() {
    setFeedback(null);

    startDeleteTransition(async () => {
      try {
        if (modalMode === "single" && singleTarget) {
          const res = await deleteSingleProduct(singleTarget.id);
          if (!res.success) throw new Error(res.error);

          setSelectedIds((prev) => prev.filter((id) => id !== singleTarget.id));
          setFeedback({
            type: "success",
            message: isEn
              ? `Product "${singleTarget.name}" deleted successfully.`
              : `Produk "${singleTarget.name}" berhasil dihapus.`,
          });
        } else if (modalMode === "selected") {
          const res = await deleteSelectedProducts(selectedIds);
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? selectedIds.length;
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: isEn
              ? `${deletedCount} selected products deleted successfully.`
              : `${deletedCount} produk terpilih berhasil dihapus.`,
          });
        } else if (modalMode === "all") {
          const res = await deleteAllProducts();
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? totalAllProducts;
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: isEn
              ? `All products (${deletedCount} products) deleted successfully.`
              : `Seluruh data produk (${deletedCount} produk) berhasil dihapus.`,
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
    params.delete("page"); // Reset ke halaman 1 saat mengubah limit
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
            data-loading-message={isEn ? `Loading products page ${currentPage - 1}...` : `Memuat produk halaman ${currentPage - 1}...`}
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
              data-loading-message={isEn ? `Loading products page ${p}...` : `Memuat produk halaman ${p}...`}
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
            data-loading-message={isEn ? `Loading product page ${currentPage + 1}...` : `Memuat produk halaman ${currentPage + 1}...`}
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
              {isEn ? `${selectedIds.length} products selected` : `${selectedIds.length} produk dipilih`}
            </span>
          ) : (
            <span className="text-xs font-medium text-espresso-600">
              {totalMatching === 0
                ? (isEn ? "No products found" : "Tidak ada produk ditemukan")
                : pageSize
                ? (isEn
                    ? `Showing ${startIndex} - ${endIndex} of ${totalMatching} products`
                    : `Menampilkan ${startIndex} - ${endIndex} dari ${totalMatching} produk`)
                : (isEn
                    ? `Showing all ${totalMatching} products`
                    : `Menampilkan semua ${totalMatching} produk`)}
              {totalAllProducts !== totalMatching && (isEn ? ` (total ${totalAllProducts} in catalog)` : ` (total ${totalAllProducts} di katalog)`)}
              {searchQuery && ` (filter: "${searchQuery}")`}
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
                    data-loading-message={isEn ? `Showing ${opt === "all" ? "all" : opt} products per page...` : `Menampilkan ${opt === "all" ? "semua" : opt} produk per halaman...`}
                    className="rounded-md px-2.5 py-1 font-semibold text-espresso-600 hover:text-espresso-900 transition"
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {isAdmin && (
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
              {totalAllProducts > 0 && (
                <button
                  type="button"
                  onClick={openDeleteAll}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50/60 px-3.5 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 hover:border-rose-400 active:scale-95"
                  title={isEn ? "Delete All Products" : "Hapus Seluruh Produk"}
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                  {isEn ? "Delete All Products" : "Hapus Semua Produk"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabel Produk */}
      <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-espresso-50/70 text-xs uppercase text-espresso-500">
              <tr>
                {isAdmin && (
                  <th className="w-12 px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      disabled={products.length === 0}
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
                )}
                <th className="px-4 py-3">{isEn ? "PRODUCT" : "PRODUK"}</th>
                <th className="px-4 py-3">{isEn ? "CATEGORY" : "KATEGORI"}</th>
                <th className="px-4 py-3">{isEn ? "TYPE" : "TIPE"}</th>
                <th className="px-4 py-3">{isEn ? "PRICE" : "HARGA"}</th>
                <th className="px-4 py-3">{isEn ? "STOCK" : "STOK"}</th>
                <th className="px-4 py-3">{isEn ? "STATUS" : "STATUS"}</th>
                <th className="px-4 py-3 text-right">{isEn ? "ACTIONS" : "AKSI"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-espresso-400">
                    {isEn ? "No matching products found." : "Tidak ada produk yang sesuai."}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const totalStock = p.hasVariants
                    ? p.variants.reduce((acc, v) => acc + v.stock, 0)
                    : p.stock;

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected ? "bg-caramel-50/60" : "hover:bg-cream/30"
                      }`}
                    >
                      {isAdmin && (
                        <td className="w-12 px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleSelectRow(p.id)}
                            className="flex items-center justify-center text-espresso-600 hover:text-caramel-600"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-4 w-4 text-caramel-600" />
                            ) : (
                              <Square className="h-4 w-4 text-espresso-300" />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-latte">
                            {p.image && (
                              <Image
                                src={p.image}
                                alt={p.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-espresso-900">{p.name}</p>
                            <p className="text-xs text-espresso-400">SKU: {p.sku || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-espresso-600">
                        {p.category
                          ? getLocalizedCategoryName(p.category.name, "", locale)
                          : (isEn ? "Uncategorized" : "Tanpa Kategori")}
                      </td>
                      <td className="px-4 py-3">
                        {p.hasVariants ? (
                          <span className="inline-flex rounded-full bg-caramel-50 px-2 py-0.5 text-xs font-semibold text-caramel-800">
                            {p.variants.length} {isEn ? (p.variants.length === 1 ? "Variant" : "Variants") : "Varian"}
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-latte px-2 py-0.5 text-xs text-espresso-700">
                            {isEn ? "Single" : "Tunggal"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-espresso-900">
                        {formatCurrency(p.price, currency)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium ${
                            totalStock <= 5 ? "text-rose-600 font-bold" : "text-espresso-800"
                          }`}
                        >
                          {totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            p.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-800"
                              : "bg-espresso-100 text-espresso-600"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="rounded-lg p-1.5 text-espresso-600 hover:bg-latte transition"
                              title={isEn ? "Edit Product" : "Edit Produk"}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openSingleDelete(p)}
                              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                              title={isEn ? `Delete product ${p.name}` : `Hapus produk ${p.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-espresso-400 italic">
                            {isEn ? "View Only" : "Lihat Saja"}
                          </span>
                        )}
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
                <strong className="text-espresso-900">{totalPages}</strong> ({totalMatching} {isEn ? "products" : "produk"})
              </>
            ) : (
              <>{isEn ? `All ${totalMatching} products shown on 1 page` : `Semua ${totalMatching} produk ditampilkan dalam 1 halaman`}</>
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
                  {modalMode === "single" && (isEn ? "Delete Product" : "Hapus Produk")}
                  {modalMode === "selected" && (isEn ? "Delete Selected Products" : "Hapus Produk Terpilih")}
                  {modalMode === "all" && (isEn ? "Delete ALL Products (Clear All)" : "Hapus Seluruh Produk (Delete ALL)")}
                </h3>
                <p className="mt-1.5 text-xs text-espresso-600 leading-relaxed">
                  {modalMode === "single" && singleTarget && (
                    <>
                      {isEn ? "Are you sure you want to delete product " : "Apakah Anda yakin ingin menghapus produk "}
                      <strong className="text-espresso-900">{singleTarget.name}</strong>?
                    </>
                  )}
                  {modalMode === "selected" && (
                    <>
                      {isEn ? "You are about to delete " : "Anda akan menghapus "}
                      <strong className="text-espresso-900">
                        {selectedIds.length} {isEn ? "products" : "produk"}
                      </strong>{" "}
                      {isEn ? "currently selected." : "yang sedang dipilih."}
                    </>
                  )}
                  {modalMode === "all" && (
                    <>
                      {isEn ? "You are about to delete " : "Anda akan menghapus "}
                      <strong className="text-rose-700">
                        {isEn ? `ALL (${totalAllProducts}) products` : `SELURUH (${totalAllProducts}) data produk`}
                      </strong>{" "}
                      {isEn ? "registered in the store catalog." : "yang terdaftar dalam katalog toko."}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Catatan Info */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="leading-relaxed">
                {isEn ? (
                  <>
                    This action <strong>cannot be undone</strong>. Past order histories involving
                    these items remain safely archived in sales reporting database.
                  </>
                ) : (
                  <>
                    Tindakan ini <strong>tidak dapat dibatalkan</strong>. Riwayat pesanan yang pernah
                    dibuat pelanggan tetap aman tersimpan dalam database laporan sebagai arsip penjualan.
                  </>
                )}
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={closeModal}
                className="cursor-pointer rounded-lg border border-espresso-200 bg-white px-4 py-2 text-xs font-semibold text-espresso-700 hover:bg-espresso-50 disabled:opacity-50"
              >
                {isEn ? "Cancel" : "Batal"}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    {isEn ? "Processing..." : "Memproses..."}
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {modalMode === "single" && (isEn ? "Yes, Delete Product" : "Ya, Hapus Produk")}
                    {modalMode === "selected" && (isEn ? `Delete ${selectedIds.length} Products` : `Hapus ${selectedIds.length} Produk`)}
                    {modalMode === "all" && (isEn ? `Yes, Delete All (${totalAllProducts})` : `Ya, Hapus Semua (${totalAllProducts})`)}
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
