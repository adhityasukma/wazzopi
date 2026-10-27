"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Edit2,
  FolderPlus,
  Loader2,
  MinusSquare,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react";
import {
  saveCategory,
  deleteSingleCategory,
  deleteSelectedCategories,
  deleteAllCategories,
} from "@/actions/categories";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/admin/image-upload";
import { useAppLoading } from "@/components/loading-provider";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: { products: number };
};

type Props = {
  categories: CategoryItem[];
  totalMatching: number;
  totalAllCategories: number;
  currentPage: number;
  totalPages: number;
  pageSize: number | null; // null jika "all"
  currentLimit: string; // "20" | "50" | "100" | "all"
  searchQuery?: string;
};

export function CategoriesManager({
  categories,
  totalMatching,
  totalAllCategories,
  currentPage,
  totalPages,
  pageSize,
  currentLimit,
  searchQuery = "",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [state, formAction, isPending] = useActionState(saveCategory, undefined);
  const { showLoading, hideLoading } = useAppLoading();

  // Multi-select & Delete state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [modalMode, setModalMode] = useState<"single" | "selected" | "all" | null>(null);
  const [singleTarget, setSingleTarget] = useState<CategoryItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const allVisibleIds = categories.map((c) => c.id);
  const isAllSelected =
    categories.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  useEffect(() => {
    if (isPending) {
      showLoading(
        editingCategory
          ? "Menyimpan perubahan kategori..."
          : "Menambahkan kategori baru..."
      );
    } else {
      hideLoading();
    }
  }, [isPending, editingCategory, showLoading, hideLoading]);

  function handleEdit(cat: CategoryItem) {
    setEditingCategory(cat);
  }

  function handleReset() {
    setEditingCategory(null);
  }

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

  function openSingleDelete(cat: CategoryItem) {
    setSingleTarget(cat);
    setModalMode("single");
  }

  function openSelectedDelete() {
    if (selectedIds.length === 0) return;
    setModalMode("selected");
  }

  function openDeleteAll() {
    if (totalAllCategories === 0) return;
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
          const res = await deleteSingleCategory(singleTarget.id);
          if (!res.success) throw new Error(res.error);

          setSelectedIds((prev) => prev.filter((id) => id !== singleTarget.id));
          if (editingCategory?.id === singleTarget.id) setEditingCategory(null);
          setFeedback({
            type: "success",
            message: `Kategori "${singleTarget.name}" berhasil dihapus.`,
          });
        } else if (modalMode === "selected") {
          const res = await deleteSelectedCategories(selectedIds);
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? selectedIds.length;
          if (editingCategory && selectedIds.includes(editingCategory.id)) {
            setEditingCategory(null);
          }
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: `${deletedCount} kategori terpilih berhasil dihapus.`,
          });
        } else if (modalMode === "all") {
          const res = await deleteAllCategories();
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? totalAllCategories;
          setEditingCategory(null);
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: `Seluruh kategori (${deletedCount} kategori) berhasil dihapus.`,
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

  function getResetSearchHref() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
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
            data-loading-message={`Memuat kategori halaman ${currentPage - 1}...`}
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
              data-loading-message={`Memuat kategori halaman ${p}...`}
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
            data-loading-message={`Memuat kategori halaman ${currentPage + 1}...`}
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

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Kolom Kiri: Tabel Kategori, Pencarian & Pagination */}
        <div className="lg:col-span-7 space-y-4">
          {/* Form Pencarian */}
          <div className="rounded-xl border border-latte bg-white p-3.5 shadow-xs">
            <form
              data-loading-message="Mencari kategori..."
              className="flex items-center gap-2"
            >
              {currentLimit !== "20" && <input type="hidden" name="limit" value={currentLimit} />}

              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-espresso-400" />
                <input
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Cari nama, deskripsi, atau slug kategori..."
                  className="w-full rounded-lg border border-espresso-100 bg-white py-1.5 pl-9 pr-3 text-sm text-espresso-900 placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-caramel-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-espresso-700 px-4 py-1.5 text-xs font-semibold text-cream hover:bg-espresso-800"
              >
                Cari
              </button>
              {searchQuery && (
                <Link
                  href={getResetSearchHref()}
                  data-loading-message="Mereset kata kunci pencarian..."
                  className="rounded-lg border border-espresso-200 px-3 py-1.5 text-xs font-semibold text-espresso-600 hover:bg-espresso-50 transition"
                  title="Kosongkan pencarian"
                >
                  Reset
                </Link>
              )}
            </form>
          </div>

          {/* Toolbar Show Data & Aksi Massal */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-latte bg-white p-3 shadow-xs">
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-caramel-100 px-3 py-1.5 text-xs font-bold text-caramel-900">
                  <CheckSquare className="h-4 w-4 text-caramel-700" />
                  {selectedIds.length} kategori dipilih
                </span>
              ) : (
                <span className="text-xs font-medium text-espresso-600">
                  {totalMatching === 0
                    ? "Tidak ada kategori ditemukan"
                    : pageSize
                    ? `Menampilkan ${startIndex} - ${endIndex} dari ${totalMatching} kategori`
                    : `Menampilkan semua ${totalMatching} kategori`}
                  {totalAllCategories !== totalMatching && ` (total ${totalAllCategories} di sistem)`}
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
                        data-loading-message={`Menampilkan ${opt === "all" ? "semua" : opt} kategori per halaman...`}
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
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus Terpilih ({selectedIds.length})
                  </button>
                )}

                {/* Tombol Delete ALL */}
                {totalAllCategories > 0 && (
                  <button
                    type="button"
                    onClick={openDeleteAll}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50/60 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 hover:border-rose-400 active:scale-95"
                    title="Hapus Seluruh Kategori"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    Hapus Semua
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tabel Kategori */}
          <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-espresso-50/70 text-xs uppercase text-espresso-500">
                  <tr>
                    <th className="w-12 px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        disabled={categories.length === 0}
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
                    <th className="px-4 py-3">Nama Kategori</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Jumlah Produk</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-latte">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-espresso-400">
                        Tidak ada kategori produk yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    categories.map((c) => {
                      const isSelected = selectedIds.includes(c.id);

                      return (
                        <tr
                          key={c.id}
                          className={`transition-colors ${
                            isSelected ? "bg-caramel-50/60" : "hover:bg-cream/30"
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
                          <td className="px-4 py-3">
                            <p className="font-semibold text-espresso-900">{c.name}</p>
                            {c.description && (
                              <p className="text-xs text-espresso-400 line-clamp-1">{c.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-espresso-600">{c.slug}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full bg-latte px-2.5 py-0.5 text-xs font-semibold text-espresso-800">
                              {c._count.products} item
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(c)}
                                className="rounded-lg p-1.5 text-espresso-600 hover:bg-latte"
                                title="Edit Kategori"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openSingleDelete(c)}
                                className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition"
                                title="Hapus Kategori"
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
                    <strong className="text-espresso-900">{totalPages}</strong> ({totalMatching} kategori)
                  </>
                ) : (
                  <>Semua {totalMatching} kategori ditampilkan dalam 1 halaman</>
                )}
              </div>

              <div>{renderPaginationButtons()}</div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Tambah/Edit Kategori */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs sticky top-6">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3 flex items-center gap-2">
              <FolderPlus className="h-4 w-4 text-caramel-500" />
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </h2>

            {state?.error && <Alert tone="error" className="mt-4">{state.error}</Alert>}
            {state?.success && <Alert tone="success" className="mt-4">{state.success}</Alert>}

            <form action={formAction} className="mt-4 space-y-4">
              {editingCategory && <input type="hidden" name="id" value={editingCategory.id} />}

              <Field label="Nama Kategori *">
                <Input
                  name="name"
                  defaultValue={editingCategory?.name || ""}
                  key={editingCategory?.id || "new-name"}
                  placeholder="Contoh: Biji Kopi"
                  required
                />
              </Field>

              <Field label="Deskripsi">
                <Textarea
                  name="description"
                  defaultValue={editingCategory?.description || ""}
                  key={editingCategory?.id || "new-desc"}
                  placeholder="Deskripsi singkat mengenai jenis produk dalam kategori ini..."
                  rows={3}
                />
              </Field>

              <ImageUpload
                name="image"
                defaultValue={editingCategory?.image || ""}
                key={editingCategory?.id || "new-img"}
                label="Foto Cover Kategori"
              />

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1 justify-center">
                  {isPending
                    ? "Menyimpan..."
                    : editingCategory
                    ? "Simpan Perubahan"
                    : "Tambah Kategori"}
                </Button>
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-espresso-200 px-3 py-2 text-xs font-semibold text-espresso-700 hover:bg-latte"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
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
                  {modalMode === "single" && "Hapus Kategori"}
                  {modalMode === "selected" && "Hapus Kategori Terpilih"}
                  {modalMode === "all" && "Hapus Seluruh Kategori (Delete ALL)"}
                </h3>
                <p className="mt-1.5 text-xs text-espresso-600 leading-relaxed">
                  {modalMode === "single" && singleTarget && (
                    <>
                      Apakah Anda yakin ingin menghapus kategori{" "}
                      <strong className="text-espresso-900">{singleTarget.name}</strong>?
                    </>
                  )}
                  {modalMode === "selected" && (
                    <>
                      Anda akan menghapus{" "}
                      <strong className="text-espresso-900">
                        {selectedIds.length} kategori
                      </strong>{" "}
                      yang sedang dipilih.
                    </>
                  )}
                  {modalMode === "all" && (
                    <>
                      Anda akan menghapus{" "}
                      <strong className="text-rose-700">
                        SELURUH ({totalAllCategories}) kategori produk
                      </strong>{" "}
                      yang terdaftar di sistem toko.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Catatan Info Produk Terkait */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="leading-relaxed">
                {modalMode === "single" && singleTarget && singleTarget._count.products > 0 ? (
                  <>
                    Kategori ini memiliki <strong>{singleTarget._count.products} produk</strong>.
                    Produk-produk tersebut tidak akan dihapus, melainkan status kategorinya akan
                    menjadi tanpa kategori (uncategorized).
                  </>
                ) : (
                  <>
                    Tindakan ini <strong>tidak dapat dibatalkan</strong>. Produk yang berada dalam
                    kategori ini tetap aman dan tidak akan terhapus dari katalog toko.
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
                Batal
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
                    Memproses...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    {modalMode === "single" && "Ya, Hapus Kategori"}
                    {modalMode === "selected" && `Hapus ${selectedIds.length} Kategori`}
                    {modalMode === "all" && `Ya, Hapus Semua (${totalAllCategories})`}
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
