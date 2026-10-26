import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const metadata = {
  title: "Kelola Kategori Produk",
};

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">Kategori Produk</h1>
        <p className="mt-1 text-sm text-espresso-500">
          Atur pengelompokan produk seperti Biji Kopi, Kopi Bubuk, Cold Brew, dsb.
        </p>
      </div>

      <CategoriesManager categories={categories} />
    </div>
  );
}
