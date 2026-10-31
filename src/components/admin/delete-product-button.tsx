"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/actions/products";
import { useI18n } from "@/i18n/provider";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  return (
    <form
      action={deleteProduct}
      data-loading-message={
        isEn ? `Deleting product "${name}"...` : `Menghapus produk "${name}"...`
      }
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
        title={isEn ? "Delete Product" : "Hapus Produk"}
        onClick={(e) => {
          const msg = isEn
            ? `Are you sure you want to delete product "${name}"?`
            : `Yakin ingin menghapus produk "${name}"?`;
          if (!confirm(msg)) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
