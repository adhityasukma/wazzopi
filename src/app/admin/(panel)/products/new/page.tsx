import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = {
  title: "Tambah Produk Baru",
};

export default async function NewProductPage() {
  const session = await requireStaff();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">Tambah Produk Baru</h1>
        <p className="mt-1 text-sm text-espresso-500">
          Isi informasi detail produk kopi atau perlengkapan seduh Anda.
        </p>
      </div>

      <ProductForm categories={categories} isStaffKaryawan={session.role === "KARYAWAN"} />
    </div>
  );
}
