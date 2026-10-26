"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { createProduct, updateProduct } from "@/actions/products";
import { Alert, Button, Field, Input, Select, Switch, Textarea } from "@/components/ui";
import { ImageUpload } from "@/components/admin/image-upload";

type VariantItem = {
  id?: string;
  name: string;
  sku?: string | null;
  price: number;
  stock: number;
};

type Props = {
  product?: {
    id: string;
    name: string;
    description: string | null;
    categoryId: string | null;
    image: string | null;
    price: number;
    comparePrice: number | null;
    stock: number;
    sku: string | null;
    weight: number;
    status: string;
    featured: boolean;
    hasVariants: boolean;
    variants: VariantItem[];
  };
  categories: { id: string; name: string }[];
  isStaffKaryawan?: boolean;
};

export function ProductForm({ product, categories, isStaffKaryawan }: Props) {
  const isEditing = !!product;

  const action = isEditing
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, formAction, isPending] = useActionState(action, undefined);

  const [hasVariants, setHasVariants] = useState(product?.hasVariants ?? false);
  const [variants, setVariants] = useState<VariantItem[]>(
    product?.variants ?? [
      { name: "250g - Biji Utuh", sku: "", price: 95000, stock: 20 },
      { name: "250g - Bubuk", sku: "", price: 95000, stock: 20 },
    ]
  );

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      { name: "", sku: "", price: 0, stock: 0 },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVariantField(
    index: number,
    field: keyof VariantItem,
    val: string | number
  ) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: val } : v))
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {state?.error && <Alert tone="error">{state.error}</Alert>}
      {state?.success && <Alert tone="success">{state.success}</Alert>}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Kolom Kiri: Info Dasar & Varian */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Informasi Umum
            </h2>

            <Field label="Nama Produk *">
              <Input
                name="name"
                defaultValue={product?.name || ""}
                placeholder="Contoh: Arabica Gayo Wine Process"
                required
              />
            </Field>

            <Field label="Deskripsi Produk">
              <Textarea
                name="description"
                defaultValue={product?.description || ""}
                placeholder="Jelaskan aroma, notes rasa, asal kebun, dan cara seduh yang cocok..."
                rows={5}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Kategori Produk">
                <Select name="categoryId" defaultValue={product?.categoryId || ""}>
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Berat Produk (Gram)">
                <Input
                  name="weight"
                  type="number"
                  defaultValue={product?.weight ?? 250}
                  placeholder="250"
                />
              </Field>
            </div>
          </div>

          {/* Pengaturan Varian */}
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-latte pb-3">
              <div>
                <h2 className="text-base font-bold text-espresso-900">Varian Produk</h2>
                <p className="text-xs text-espresso-400">
                  Aktifkan jika produk memiliki ukuran gramasi atau bentuk gilingan berbeda
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-espresso-800">
                <input
                  type="checkbox"
                  name="hasVariants"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                />
                Memiliki Varian
              </label>
            </div>

            {hasVariants ? (
              <div className="space-y-4">
                {/* Hidden input JSON variants */}
                <input type="hidden" name="variants" value={JSON.stringify(variants)} />

                <div className="space-y-3">
                  {variants.map((v, i) => (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-latte p-3 bg-cream/30"
                    >
                      <div className="flex-1 min-w-36">
                        <label className="text-[11px] font-medium text-espresso-600">Nama Varian</label>
                        <Input
                          value={v.name}
                          onChange={(e) => updateVariantField(i, "name", e.target.value)}
                          placeholder="Misal: 500g Biji Utuh"
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      <div className="w-28">
                        <label className="text-[11px] font-medium text-espresso-600">Harga (IDR)</label>
                        <Input
                          type="number"
                          value={v.price}
                          onChange={(e) => updateVariantField(i, "price", Number(e.target.value))}
                          placeholder="0"
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-[11px] font-medium text-espresso-600">Stok</label>
                        <Input
                          type="number"
                          value={v.stock}
                          onChange={(e) => updateVariantField(i, "stock", Number(e.target.value))}
                          placeholder="0"
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      <div className="w-28">
                        <label className="text-[11px] font-medium text-espresso-600">SKU (Opsional)</label>
                        <Input
                          value={v.sku || ""}
                          onChange={(e) => updateVariantField(i, "sku", e.target.value)}
                          placeholder="SKU-1"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="rounded-md p-1.5 text-rose-500 hover:bg-rose-50"
                          title="Hapus Varian"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Baris Varian
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Harga Satuan (IDR) *">
                  <Input
                    name="price"
                    type="number"
                    defaultValue={product?.price ?? 0}
                    placeholder="Contoh: 95000"
                    required={!hasVariants}
                  />
                </Field>
                <Field label="Harga Coret (Diskon)">
                  <Input
                    name="comparePrice"
                    type="number"
                    defaultValue={product?.comparePrice ?? ""}
                    placeholder="Opsional"
                  />
                </Field>
                <Field label="Jumlah Stok *">
                  <Input
                    name="stock"
                    type="number"
                    defaultValue={product?.stock ?? 10}
                    placeholder="10"
                    required={!hasVariants}
                  />
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Gambar & Status */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Foto Produk
            </h2>

            <ImageUpload
              name="image"
              defaultValue={product?.image || "/images/p-arabica-gayo.jpg"}
              label="Foto Utama Produk"
            />

            <Field label="SKU Produk Utama">
              <Input
                name="sku"
                defaultValue={product?.sku || ""}
                placeholder="Contoh: WZ-GAYO-01"
              />
            </Field>
          </div>

          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Status & Visibilitas
            </h2>

            <Field label="Status Publikasi">
              <Select name="status" defaultValue={product?.status || "PUBLISHED"}>
                <option value="PUBLISHED">PUBLISHED (Tampil di Toko)</option>
                <option value="DRAFT">DRAFT (Sembunyikan)</option>
              </Select>
            </Field>

            {!isStaffKaryawan && (
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-espresso-800">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={product?.featured ?? false}
                  className="rounded border-espresso-300 text-caramel-600 focus:ring-caramel-500 h-4 w-4"
                />
                Jadikan Produk Unggulan di Beranda
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full justify-center h-11 text-base font-semibold"
            >
              {isPending
                ? "Menyimpan..."
                : isEditing
                ? "Perbarui Produk"
                : "Simpan & Tambahkan Produk"}
            </Button>
            <Link
              href="/admin/products"
              className="block text-center text-xs text-espresso-500 hover:underline py-2"
            >
              Batal & Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
