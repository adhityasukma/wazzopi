import Link from "next/link";
import { ShieldX } from "lucide-react";
import { LinkButton } from "@/components/ui";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
        <ShieldX className="h-8 w-8" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-espresso-900">Akses Dibatasi</h1>
      <p className="mt-2 max-w-md text-sm text-espresso-500">
        Role Anda (Karyawan) hanya diizinkan untuk melihat dan menambah produk. Anda tidak memiliki akses ke halaman ini.
      </p>
      <div className="mt-6 flex gap-3">
        <LinkButton href="/admin/products/new">Tambah Produk</LinkButton>
        <LinkButton href="/admin/products" variant="outline">Daftar Produk</LinkButton>
      </div>
    </div>
  );
}
