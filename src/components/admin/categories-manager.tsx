"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  FolderPlus,
  Search,
  Trash2,
} from "lucide-react";
import { saveCategory, deleteCategory } from "@/actions/categories";
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
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [state, formAction, isPending] = useActionState(saveCategory, undefined);
  const { showLoading, hideLoading } = useAppLoading();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

        {/* Toolbar Show Data & Ringkasan */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-latte bg-white p-3 shadow-xs">
          <span className="text-xs font-medium text-espresso-600">
            {totalMatching === 0
              ? "Tidak ada kategori ditemukan"
              : pageSize
              ? `Menampilkan ${startIndex} - ${endIndex} dari ${totalMatching} kategori`
              : `Menampilkan semua ${totalMatching} kategori`}
            {totalAllCategories !== totalMatching && ` (total ${totalAllCategories} di sistem)`}
            {searchQuery && ` (filter: "${searchQuery}")`}
          </span>

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
        </div>

        {/* Tabel Kategori */}
        <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-espresso-50/70 text-xs uppercase text-espresso-500">
                <tr>
                  <th className="px-4 py-3">Nama Kategori</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Jumlah Produk</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-latte">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-espresso-400">
                      Tidak ada kategori produk yang sesuai.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className="hover:bg-cream/30">
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
                          <form action={deleteCategory} data-loading-message={`Menghapus kategori "${c.name}"...`}>
                            <input type="hidden" name="id" value={c.id} />
                            <button
                              type="submit"
                              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                              title="Hapus Kategori"
                              onClick={(e) => {
                                if (c._count.products > 0) {
                                  if (
                                    !confirm(
                                      `Kategori ini masih memiliki ${c._count.products} produk. Tetap hapus?`
                                    )
                                  ) {
                                    e.preventDefault();
                                  }
                                } else if (!confirm("Hapus kategori ini?")) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
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
  );
}
