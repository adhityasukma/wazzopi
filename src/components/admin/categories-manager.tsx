"use client";

import { useActionState, useState } from "react";
import { Edit2, FolderPlus, Trash2 } from "lucide-react";
import { saveCategory, deleteCategory } from "@/actions/categories";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/admin/image-upload";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: { products: number };
};

export function CategoriesManager({
  categories,
}: {
  categories: CategoryItem[];
}) {
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [state, formAction, isPending] = useActionState(saveCategory, undefined);

  function handleEdit(cat: CategoryItem) {
    setEditingCategory(cat);
  }

  function handleReset() {
    setEditingCategory(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Kolom Kiri: Tabel Kategori */}
      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
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
              {categories.map((c) => (
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
                        onClick={() => handleEdit(c)}
                        className="rounded-lg p-1.5 text-espresso-600 hover:bg-latte"
                        title="Edit Kategori"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <form action={deleteCategory}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kolom Kanan: Form Tambah/Edit Kategori */}
      <div className="lg:col-span-5">
        <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
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
