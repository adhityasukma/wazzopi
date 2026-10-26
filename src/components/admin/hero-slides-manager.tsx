"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { Check, Edit2, Eye, EyeOff, ImagePlus, Plus, Power, Trash2, X } from "lucide-react";
import { saveHeroSlide, toggleHeroSlide, deleteHeroSlide } from "@/actions/hero-slides";
import { ImageUpload } from "@/components/admin/image-upload";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import { useAppLoading } from "@/components/loading-provider";

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

export function HeroSlidesManager({ slides }: { slides: HeroSlideItem[] }) {
  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);
  const [state, formAction, isPending] = useActionState(saveHeroSlide, undefined);
  const { showLoading, hideLoading } = useAppLoading();

  useEffect(() => {
    if (isPending) {
      showLoading(
        editingSlide
          ? "Menyimpan perubahan slide..."
          : "Menambahkan slide baru..."
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

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Kolom Kiri: Tabel Slide Aktif & Nonaktif */}
      <div className="lg:col-span-7 space-y-4">
        <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
          <div className="border-b border-latte p-4">
            <h2 className="text-base font-bold text-espresso-900">Daftar Slide Beranda</h2>
            <p className="text-xs text-espresso-400">
              Total {slides.length} slide. Slide aktif otomatis berputar di bagian paling atas beranda.
            </p>
          </div>

          <div className="divide-y divide-latte">
            {slides.length === 0 ? (
              <div className="p-8 text-center text-sm text-espresso-400">
                Belum ada banner slide. Silakan buat slide pertama menggunakan formulir di sebelah kanan.
              </div>
            ) : (
              slides.map((s) => (
                <div key={s.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
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
                      onClick={() => handleEdit(s)}
                      className="rounded-lg p-2 text-espresso-600 hover:bg-latte transition-colors"
                      title="Edit Slide"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    {/* Tombol Hapus */}
                    <form action={deleteHeroSlide} data-loading-message={`Menghapus slide "${s.title}"...`}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Slide"
                        onClick={(e) => {
                          if (!confirm(`Hapus slide "${s.title}"?`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Form Tambah / Edit */}
      <div className="lg:col-span-5">
        <div className="rounded-xl border border-latte bg-white p-6 shadow-xs sticky top-24">
          <div className="flex items-center justify-between border-b border-latte pb-3">
            <h2 className="text-base font-bold text-espresso-900 flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-caramel-500" />
              {editingSlide ? "Edit Slide Banner" : "Tambah Slide Banner Baru"}
            </h2>
            {editingSlide && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-espresso-500 hover:text-espresso-800"
              >
                Batal Edit
              </button>
            )}
          </div>

          {state?.error && <Alert tone="error" className="mt-4">{state.error}</Alert>}
          {state?.success && <Alert tone="success" className="mt-4">{state.success}</Alert>}

          <form action={formAction} className="mt-4 space-y-4">
            {editingSlide && <input type="hidden" name="id" value={editingSlide.id} />}

            <Field label="Judul Utama Slide *">
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
              label="Foto Banner Slide *"
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
              <Field label="Urutan Tampil (Sort Order)">
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
                  Aktifkan Slide Ini
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-latte">
              <Button type="submit" disabled={isPending} className="flex-1 justify-center">
                {isPending
                  ? "Menyimpan..."
                  : editingSlide
                  ? "Simpan Perubahan Slide"
                  : "Tambahkan Slide"}
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
  );
}
