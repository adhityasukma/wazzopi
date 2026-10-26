"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/actions/products";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteProduct}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
        title="Hapus Produk"
        onClick={(e) => {
          if (!confirm(`Yakin ingin menghapus produk "${name}"?`)) {
            e.preventDefault();
          }
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}
