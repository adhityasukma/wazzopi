import Link from "next/link";
import { PackagePlus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { requireStaff } from "@/lib/auth";
import { LinkButton } from "@/components/ui";
import { ProductsTable } from "@/components/admin/products-table";

export const metadata = {
  title: "Kelola Produk",
};

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const session = await requireStaff();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const cat = typeof sp.category === "string" ? sp.category : undefined;
  const rawLimit = typeof sp.limit === "string" ? sp.limit : "20";
  const currentLimit = ["20", "50", "100", "all"].includes(rawLimit) ? rawLimit : "20";
  const rawPage = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;

  const where = {
    ...(q ? { name: { contains: q } } : {}),
    ...(cat ? { categoryId: cat } : {}),
  };

  const [settings, categories, totalAllProducts, totalMatching] = await Promise.all([
    getSettings(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.count(),
    prisma.product.count({ where }),
  ]);

  const pageSize = currentLimit === "all" ? null : parseInt(currentLimit, 10);
  const totalPages = pageSize ? Math.max(1, Math.ceil(totalMatching / pageSize)) : 1;
  const currentPage = Math.min(Math.max(1, isNaN(rawPage) ? 1 : rawPage), totalPages);
  const skip = pageSize ? (currentPage - 1) * pageSize : undefined;
  const take = pageSize || undefined;

  const products = await prisma.product.findMany({
    where,
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  const isAdmin = session.role === "ADMIN";

  // Helper untuk reset pencarian (mengosongkan q, namun tetap menjaga category & limit jika dipilih)
  function getResetSearchHref() {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (currentLimit !== "20") params.set("limit", currentLimit);
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  // Helper untuk filter kategori (menjaga q & limit)
  function getCategoryFilterHref(categoryId?: string) {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", categoryId);
    if (q) params.set("q", q);
    if (currentLimit !== "20") params.set("limit", currentLimit);
    const qs = params.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">Kelola Produk</h1>
          <p className="mt-1 text-sm text-espresso-500">
            Total {totalAllProducts} produk terdaftar dalam katalog
          </p>
        </div>
        <LinkButton href="/admin/products/new">
          <PackagePlus className="h-4 w-4" /> Tambah Produk Baru
        </LinkButton>
      </div>

      {/* Filter & Search */}
      <div className="rounded-xl border border-latte bg-white p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <form
          data-loading-message="Mencari produk..."
          className="flex flex-1 items-center gap-2 max-w-md"
        >
          {cat && <input type="hidden" name="category" value={cat} />}
          {currentLimit !== "20" && <input type="hidden" name="limit" value={currentLimit} />}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-espresso-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama produk..."
              className="w-full rounded-lg border border-espresso-100 bg-white py-2 pl-9 pr-3 text-sm text-espresso-900 placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-caramel-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-espresso-700 px-4 py-2 text-xs font-semibold text-cream hover:bg-espresso-800"
          >
            Cari
          </button>
          {q && (
            <Link
              href={getResetSearchHref()}
              data-loading-message="Mereset kata kunci pencarian..."
              className="rounded-lg border border-espresso-200 px-3 py-2 text-xs font-semibold text-espresso-600 hover:bg-espresso-50 transition"
              title="Kosongkan pencarian"
            >
              Reset
            </Link>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={getCategoryFilterHref()}
            data-loading-message="Memuat semua produk..."
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              !cat ? "bg-espresso-700 text-cream" : "bg-latte text-espresso-800 hover:bg-espresso-200"
            }`}
          >
            Semua
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={getCategoryFilterHref(c.id)}
              data-loading-message={`Menyaring kategori ${c.name}...`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                cat === c.id ? "bg-espresso-700 text-cream" : "bg-latte text-espresso-800 hover:bg-espresso-200"
              }`}
            >
              {c.name}
            </Link>
          ))}

          {(q || cat) && (
            <Link
              href={currentLimit !== "20" ? `/admin/products?limit=${currentLimit}` : "/admin/products"}
              data-loading-message="Mereset semua filter..."
              className="rounded-lg border border-dashed border-espresso-300 px-3 py-1.5 text-xs font-medium text-espresso-500 hover:bg-espresso-50 hover:text-espresso-800 transition"
              title="Kembali ke tampilan awal semua produk"
            >
              Reset Semua Filter
            </Link>
          )}
        </div>
      </div>

      {/* Komponen Tabel Produk dengan Multi-Select, Bulk Delete, Show Data & Pagination */}
      <ProductsTable
        products={products}
        currency={settings.currency}
        totalMatching={totalMatching}
        totalAllProducts={totalAllProducts}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        currentLimit={currentLimit}
        currentCategory={cat}
        searchQuery={q}
        isAdmin={isAdmin}
      />
    </div>
  );
}
