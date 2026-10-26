import Link from "next/link";
import type { Metadata } from "next";
import { PackageSearch } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import {
  ProductCategoryFilter,
  ProductSortFilter,
} from "@/components/shop/product-filters";
import { EmptyState, LinkButton } from "@/components/ui";
import { getProductCards } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = { title: "Semua Produk" };

const SORTS: Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput }> = {
  newest: { label: "Terbaru", orderBy: { createdAt: "desc" } },
  price_asc: { label: "Harga Terendah", orderBy: { price: "asc" } },
  price_desc: { label: "Harga Tertinggi", orderBy: { price: "desc" } },
  name: { label: "Nama A-Z", orderBy: { name: "asc" } },
};

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const sort = typeof sp.sort === "string" && SORTS[sp.sort] ? sp.sort : "newest";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true },
    }),
    getProductCards({
      where: {
        ...(category ? { category: { slug: category } } : {}),
        ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
      },
      orderBy: SORTS[sort].orderBy,
    }),
  ]);

  const activeCat = categories.find((c) => c.slug === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="border-b border-latte pb-8">
        <nav className="text-xs text-espresso-400">
          <Link href="/" className="hover:text-caramel-500">Beranda</Link> / <span className="text-espresso-700">Produk</span>
        </nav>
        <h1 className="mt-3 text-3xl font-semibold text-espresso-900 md:text-4xl">
          {activeCat ? activeCat.name : "Semua Produk"}
        </h1>
        <p className="mt-2 max-w-2xl text-espresso-400">
          {activeCat?.description || "Jelajahi koleksi kopi Nusantara, alat seduh, dan merchandise Wazzopi."}
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Sidebar Filter Kategori */}
        <aside className="lg:w-60 lg:shrink-0">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-espresso-400">Kategori</h3>
          <ProductCategoryFilter
            categories={categories}
            activeCategory={category}
            currentSort={sort}
            currentQuery={q}
          />
        </aside>

        {/* Daftar Produk & Toolbar Sorting */}
        <div className="flex-1">
          <ProductSortFilter
            totalCount={products.length}
            activeSort={sort}
            activeCategory={category}
            currentQuery={q}
          />

          {products.length === 0 ? (
            <EmptyState
              icon={<PackageSearch className="h-6 w-6" />}
              title="Produk tidak ditemukan"
              description="Coba kata kunci lain atau lihat semua produk."
              action={<LinkButton href="/products">Lihat Semua Produk</LinkButton>}
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
