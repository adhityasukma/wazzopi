import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";
import { getServerLocale } from "@/i18n/server";
import { ProductForm } from "@/components/admin/product-form";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return {
    title: locale === "en" ? "Add New Product" : "Tambah Produk Baru",
  };
}

export default async function NewProductPage() {
  const [session, locale] = await Promise.all([
    requireStaff(),
    getServerLocale(),
  ]);
  const isEn = locale === "en";
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">
          {isEn ? "Add New Product" : "Tambah Produk Baru"}
        </h1>
        <p className="mt-1 text-sm text-espresso-500">
          {isEn
            ? "Fill in product details for your coffee beans, beverages, or brewing gear."
            : "Isi informasi detail produk kopi atau perlengkapan seduh Anda."}
        </p>
      </div>

      <ProductForm categories={categories} isStaffKaryawan={session.role === "KARYAWAN"} />
    </div>
  );
}
