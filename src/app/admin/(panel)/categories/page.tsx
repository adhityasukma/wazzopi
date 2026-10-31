import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getServerLocale } from "@/i18n/server";
import { CategoriesManager } from "@/components/admin/categories-manager";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return {
    title: locale === "en" ? "Manage Product Categories" : "Kelola Kategori Produk",
  };
}

export default async function AdminCategoriesPage({
  searchParams,
}: PageProps<"/admin/categories">) {
  const [session, locale] = await Promise.all([
    requireAdmin(),
    getServerLocale(),
  ]);
  const isEn = locale === "en";
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const rawLimit = typeof sp.limit === "string" ? sp.limit : "20";
  const currentLimit = ["20", "50", "100", "all"].includes(rawLimit) ? rawLimit : "20";
  const rawPage = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { slug: { contains: q } },
          ],
        }
      : {}),
  };

  const [totalAllCategories, totalMatching] = await Promise.all([
    prisma.category.count(),
    prisma.category.count({ where }),
  ]);

  const pageSize = currentLimit === "all" ? null : parseInt(currentLimit, 10);
  const totalPages = pageSize ? Math.max(1, Math.ceil(totalMatching / pageSize)) : 1;
  const currentPage = Math.min(Math.max(1, isNaN(rawPage) ? 1 : rawPage), totalPages);
  const skip = pageSize ? (currentPage - 1) * pageSize : undefined;
  const take = pageSize || undefined;

  const categories = await prisma.category.findMany({
    where,
    orderBy: { name: "asc" },
    skip,
    take,
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">
          {isEn ? "Product Categories" : "Kategori Produk"}
        </h1>
        <p className="mt-1 text-sm text-espresso-500">
          {isEn
            ? `Total of ${totalAllCategories} product categories registered in Wazzopi`
            : `Total ${totalAllCategories} kategori produk terdaftar di Wazzopi`}
        </p>
      </div>

      <CategoriesManager
        categories={categories}
        totalMatching={totalMatching}
        totalAllCategories={totalAllCategories}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        currentLimit={currentLimit}
        searchQuery={q}
      />
    </div>
  );
}
