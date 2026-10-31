"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
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
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  MinusSquare,
  Square,
  Trash2,
  X,
} from "lucide-react";
import {
  saveHeroSlide,
  toggleHeroSlide,
  deleteSingleHeroSlide,
  deleteSelectedHeroSlides,
  deleteAllHeroSlides,
} from "@/actions/hero-slides";
import { ImageUpload } from "@/components/admin/image-upload";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import { useAppLoading } from "@/components/loading-provider";
import { useI18n } from "@/i18n/provider";

type HeroSlideItem = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  ctaLabel: string | null;
  ctaLink: string | null;
  sortOrder: number;
  active: boolean;
};

type Props = {
  slides: HeroSlideItem[];
  totalMatching: number;
  totalAllSlides: number;
  currentPage: number;
  totalPages: number;
  pageSize: number | null; // null jika "all"
  currentLimit: string; // "20" | "50" | "100" | "all"
  currentStatus: string;
  searchQuery?: string;
};

export function HeroSlidesManager({
  slides,
  totalMatching,
  totalAllSlides,
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

  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);
  const [state, formAction, isPending] = useActionState(saveHeroSlide, undefined);
  const { showLoading, hideLoading } = useAppLoading();

  // Multi-select & Delete state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [modalMode, setModalMode] = useState<"single" | "selected" | "all" | null>(null);
  const [singleTarget, setSingleTarget] = useState<HeroSlideItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const allVisibleIds = slides.map((s) => s.id);
  const isAllSelected =
    slides.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  useEffect(() => {
    if (isPending) {
      showLoading(
        editingSlide
          ? (isEn ? "Saving slide changes..." : "Menyimpan perubahan slide...")
          : (isEn ? "Adding new slide..." : "Menambahkan slide baru...")
      );
    } else {
      hideLoading();
    }
  }, [isPending, editingSlide, showLoading, hideLoading]);

  function handleEdit(s: HeroSlideItem) {
    setEditingSlide(s);
  }

  function handleReset() {
    setEditingSlide(null);
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

  function openSingleDelete(s: HeroSlideItem) {
    setSingleTarget(s);
    setModalMode("single");
  }

  function openSelectedDelete() {
    if (selectedIds.length === 0) return;
    setModalMode("selected");
  }

  function openDeleteAll() {
    if (totalAllSlides === 0) return;
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
          const res = await deleteSingleHeroSlide(singleTarget.id);
          if (!res.success) throw new Error(res.error);

          setSelectedIds((prev) => prev.filter((id) => id !== singleTarget.id));
          if (editingSlide?.id === singleTarget.id) setEditingSlide(null);
          setFeedback({
            type: "success",
            message: isEn ? `Slide "${singleTarget.title}" deleted successfully.` : `Slide "${singleTarget.title}" berhasil dihapus.`,
          });
        } else if (modalMode === "selected") {
          const res = await deleteSelectedHeroSlides(selectedIds);
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? selectedIds.length;
          if (editingSlide && selectedIds.includes(editingSlide.id)) {
            setEditingSlide(null);
          }
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: isEn ? `${deletedCount} selected slide(s) deleted successfully.` : `${deletedCount} slide terpilih berhasil dihapus.`,
          });
        } else if (modalMode === "all") {
          const res = await deleteAllHeroSlides();
          if (!res.success) throw new Error(res.error);

          const deletedCount = res.count ?? totalAllSlides;
          setEditingSlide(null);
          setSelectedIds([]);
          setFeedback({
            type: "success",
            message: `Seluruh slide (${deletedCount} slide) berhasil dihapus.`,
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
            data-loading-message={`Memuat slide halaman ${currentPage - 1}...`}
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
              data-loading-message={`Memuat slide halaman ${p}...`}
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
            data-loading-message={`Memuat slide halaman ${currentPage + 1}...`}
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
        {/* Kolom Kiri: Tabel Slide Aktif & Nonaktif */}
        <div className="lg:col-span-7 space-y-4">
          {/* Toolbar Show Data & Aksi Massal */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-latte bg-white p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Checkbox Select All */}
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={slides.length === 0}
                className="flex items-center justify-center text-espresso-600 hover:text-caramel-600 disabled:opacity-40"
                title={isAllSelected ? "Batalkan semua pilihan" : "Pilih semua di halaman ini"}
              >
                {isAllSelected ? (
                  <CheckSquare className="h-5 w-5 text-caramel-600" />
                ) : isSomeSelected ? (
                  <MinusSquare className="h-5 w-5 text-caramel-600" />
                ) : (
                  <Square className="h-5 w-5 text-espresso-400" />
                )}
              </button>

              {selectedIds.length > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-caramel-100 px-3 py-1.5 text-xs font-bold text-caramel-900">
                  <CheckSquare className="h-4 w-4 text-caramel-700" />
                  {selectedIds.length} {isEn ? "slide(s) selected" : "slide dipilih"}
                </span>
              ) : (
                <span className="text-xs font-medium text-espresso-600">
                  {totalMatching === 0
                    ? "Tidak ada slide ditemukan"
                    : pageSize
                    ? `Menampilkan ${startIndex} - ${endIndex} dari ${totalMatching} slide`
                    : `Menampilkan semua ${totalMatching} slide`}
                  {totalAllSlides !== totalMatching && ` (total ${totalAllSlides} di sistem)`}
                  {searchQuery && ` (filter: "${searchQuery}")`}
                </span>
              )}

              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-espresso-500 hover:bg-latte/50 hover:text-espresso-800"
                >
                  {isEn ? "Clear Selection" : "Batalkan Pilihan"}
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
                        data-loading-message={`Menampilkan ${opt === "all" ? "semua" : opt} slide per halaman...`}
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
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isEn ? `Delete Selected (${selectedIds.length})` : `Hapus Terpilih (${selectedIds.length})`}
                  </button>
                )}

                {/* Tombol Delete ALL */}
                {totalAllSlides > 0 && (
                  <button
                    type="button"
                    onClick={openDeleteAll}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50/60 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 hover:border-rose-400 active:scale-95"
                    title="Hapus Seluruh Slide"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    {isEn ? "Delete All Slides" : "Hapus Semua Slide"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Daftar Kartu Slide */}
          <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
            <div className="divide-y divide-latte">
              {slides.length === 0 ? (
                <div className="p-8 text-center text-sm text-espresso-400">
                  Tidak ada banner slide yang sesuai filter.
                </div>
              ) : (
                slides.map((s) => {
                  const isSelected = selectedIds.includes(s.id);

                  return (
                    <div
                      key={s.id}
                      className={`flex flex-col gap-4 p-4 transition-colors sm:flex-row sm:items-center ${
                        isSelected ? "bg-caramel-50/60" : "hover:bg-cream/30"
                      }`}
                    >
                      {/* Checkbox baris */}
                      <button
                        type="button"
                        onClick={() => toggleSelectRow(s.id)}
                        className="flex items-center justify-center text-espresso-600 hover:text-caramel-600 self-start sm:self-center"
                        title={isSelected ? "Batalkan pilihan" : "Pilih slide ini"}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-caramel-600" />
                        ) : (
                          <Square className="h-5 w-5 text-espresso-300" />
                        )}
                      </button>

                      <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-espresso-900 shadow-xs">
                        <Image
                          src={s.image}
                          alt={s.title}
                          fill
                          sizes="144px"
                          className="object-cover"
                        />
                        {!s.active && (
                          <div className="absolute inset-0 bg-espresso-900/70 flex items-center justify-center">
                            <span className="rounded bg-rose-900/80 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                              Nonaktif
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-caramel-600 bg-caramel-50 px-1.5 py-0.5 rounded">
                            Urutan #{s.sortOrder}
                          </span>
                          <span
                            className={`inline-flex rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                              s.active
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-espresso-100 text-espresso-500"
                            }`}
                          >
                            {s.active ? "Aktif Tampil" : "Disembunyikan"}
                          </span>
                        </div>

                        <h3 className="mt-1 font-bold text-sm text-espresso-900 truncate">
                          {s.title}
                        </h3>
                        {s.subtitle && (
                          <p className="text-xs text-espresso-500 line-clamp-1">{s.subtitle}</p>
                        )}
                        {s.ctaLabel && (
                          <p className="mt-1 text-[11px] text-espresso-400">
                            Tombol CTA: <strong className="text-espresso-700">{s.ctaLabel}</strong> &rarr;{" "}
                            <code className="font-mono">{s.ctaLink || "#"}</code>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 sm:self-center">
                        {/* Toggle Aktif / Nonaktif */}
                        <form action={toggleHeroSlide} data-loading-message="Mengubah status slide...">
                          <input type="hidden" name="id" value={s.id} />
                          <button
                            type="submit"
                            className={`rounded-lg p-2 transition-colors ${
                              s.active
                                ? "text-emerald-700 hover:bg-emerald-50"
                                : "text-espresso-400 hover:bg-espresso-100"
                            }`}
                            title={s.active ? "Nonaktifkan Slide" : "Aktifkan Slide"}
                          >
                            {s.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </form>

                        {/* Tombol Edit */}
                        <button
                          type="button"
                          onClick={() => handleEdit(s)}
                          className="rounded-lg p-2 text-espresso-600 hover:bg-latte transition-colors"
                          title="Edit Slide"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {/* Tombol Hapus */}
                        <button
                          type="button"
                          onClick={() => openSingleDelete(s)}
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Hapus Slide"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Tabel: Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-latte bg-espresso-50/30 px-4 py-3">
              <div className="text-xs text-espresso-500">
                {pageSize ? (
                  <>
                    Halaman <strong className="text-espresso-900">{currentPage}</strong> dari{" "}
                    <strong className="text-espresso-900">{totalPages}</strong> ({totalMatching} slide)
                  </>
                ) : (
                  <>Semua {totalMatching} slide ditampilkan dalam 1 halaman</>
                )}
              </div>

              <div>{renderPaginationButtons()}</div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Tambah / Edit */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs sticky top-24">
            <div className="flex items-center justify-between border-b border-latte pb-3">
              <h2 className="text-base font-bold text-espresso-900 flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-caramel-500" />
                {editingSlide ? (isEn ? "Edit Slide Banner" : "Edit Slide Banner") : (isEn ? "Add New Slide Banner" : "Tambah Slide Banner Baru")}
              </h2>
              {editingSlide && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-espresso-500 hover:text-espresso-800"
                >
                  {isEn ? "Cancel Edit" : "Batal Edit"}
                </button>
              )}
            </div>

            {state?.error && <Alert tone="error" className="mt-4">{state.error}</Alert>}
            {state?.success && <Alert tone="success" className="mt-4">{state.success}</Alert>}

            <form action={formAction} className="mt-4 space-y-4">
              {editingSlide && <input type="hidden" name="id" value={editingSlide.id} />}

              <Field label={isEn ? "Slide Main Title *" : "Judul Utama Slide *"}>
                <Input
                  name="title"
                  defaultValue={editingSlide?.title || ""}
                  key={editingSlide?.id ? `t-${editingSlide.id}` : "new-title"}
                  placeholder="Contoh: Satu Teguk, Banyak Cerita"
                  required
                />
              </Field>

              <Field label="Subjudul / Deskripsi Pendek">
                <Textarea
                  name="subtitle"
                  defaultValue={editingSlide?.subtitle || ""}
                  key={editingSlide?.id ? `st-${editingSlide.id}` : "new-subtitle"}
                  placeholder="Kopi pilihan dari dataran tinggi Nusantara, disangrai segar setiap minggu..."
                  rows={3}
                />
              </Field>

              <ImageUpload
                name="image"
                defaultValue={editingSlide?.image || "/images/hero-1.jpg"}
                key={editingSlide?.id ? `img-${editingSlide.id}` : "new-img"}
                label={isEn ? "Slide Banner Image *" : "Foto Banner Slide *"}
                hint="Format 16:9 disarankan untuk tampilan layar penuh yang optimal."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Teks Tombol (CTA Label)">
                  <Input
                    name="ctaLabel"
                    defaultValue={editingSlide?.ctaLabel || "Belanja Sekarang"}
                    key={editingSlide?.id ? `cl-${editingSlide.id}` : "new-cl"}
                    placeholder="Belanja Sekarang"
                  />
                </Field>

                <Field label="Link Tujuan (CTA Link)">
                  <Input
                    name="ctaLink"
                    defaultValue={editingSlide?.ctaLink || "/products"}
                    key={editingSlide?.id ? `ck-${editingSlide.id}` : "new-ck"}
                    placeholder="/products"
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 items-center pt-2">
                <Field label={isEn ? "Display Order (Sort Order)" : "Urutan Tampil (Sort Order)"}>
                  <Input
                    name="sortOrder"
                    type="number"
                    defaultValue={editingSlide?.sortOrder ?? (slides.length + 1)}
                    key={editingSlide?.id ? `so-${editingSlide.id}` : "new-so"}
                    placeholder="1"
                  />
                </Field>

                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-espresso-800">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={editingSlide ? editingSlide.active : true}
                      key={editingSlide?.id ? `act-${editingSlide.id}` : "new-act"}
                      className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                    />
                    {isEn ? "Activate This Slide" : "Aktifkan Slide Ini"}
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-latte">
                <Button type="submit" disabled={isPending} className="flex-1 justify-center">
                  {isPending
                    ? (isEn ? "Saving..." : "Menyimpan...")
                    : editingSlide
                    ? (isEn ? "Save Slide Changes" : "Simpan Perubahan Slide")
                    : (isEn ? "Add Slide" : "Tambahkan Slide")}
                </Button>
                {editingSlide && (
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
                  {modalMode === "single" && (isEn ? "Delete Hero Slide" : "Hapus Hero Slide")}
                  {modalMode === "selected" && (isEn ? "Delete Selected Slides" : "Hapus Slide Terpilih")}
                  {modalMode === "all" && (isEn ? "Delete ALL Slides" : "Hapus Seluruh Slide (Delete ALL)")}
                </h3>
                <p className="mt-1.5 text-xs text-espresso-600 leading-relaxed">
                  {modalMode === "single" && singleTarget && (
                    <>
                      Apakah Anda yakin ingin menghapus slide{" "}
                      <strong className="text-espresso-900">{singleTarget.title}</strong>?
                    </>
                  )}
                  {modalMode === "selected" && (
                    <>
                      Anda akan menghapus{" "}
                      <strong className="text-espresso-900">
                        {selectedIds.length} banner slide
                      </strong>{" "}
                      yang sedang dipilih.
                    </>
                  )}
                  {modalMode === "all" && (
                    <>
                      Anda akan menghapus{" "}
                      <strong className="text-rose-700">
                        SELURUH ({totalAllSlides}) banner slide
                      </strong>{" "}
                      yang tersimpan di sistem toko.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Catatan Info */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
              <p className="leading-relaxed">
                Tindakan ini <strong>tidak dapat dibatalkan</strong>. Slide yang dihapus tidak akan
                ditampilkan lagi di slider beranda toko.
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
                    {modalMode === "single" && (isEn ? "Yes, Delete Slide" : "Ya, Hapus Slide")}
                    {modalMode === "selected" && (isEn ? `Delete ${selectedIds.length} Slides` : `Hapus ${selectedIds.length} Slide`)}
                    {modalMode === "all" && (isEn ? `Yes, Delete All (${totalAllSlides})` : `Ya, Hapus Semua (${totalAllSlides})`)}
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
