"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAppLoading } from "@/components/loading-provider";
import { cn } from "@/lib/utils";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

type SortItem = {
  key: string;
  label: string;
};

export const PRODUCT_SORTS: SortItem[] = [
  { key: "newest", label: "Terbaru" },
  { key: "price_asc", label: "Harga Terendah" },
  { key: "price_desc", label: "Harga Tertinggi" },
  { key: "name", label: "Nama A-Z" },
];

function buildProductsUrl({
  category,
  q,
  sort,
}: {
  category?: string;
  q?: string;
  sort?: string;
}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  if (sort && sort !== "newest") params.set("sort", sort);
  const query = params.toString();
  return `/products${query ? `?${query}` : ""}`;
}

export function ProductCategoryFilter({
  categories,
  activeCategory,
  currentSort,
  currentQuery,
}: {
  categories: CategoryItem[];
  activeCategory?: string;
  currentSort?: string;
  currentQuery?: string;
}) {
  const router = useRouter();
  const { startTransitionLoading } = useAppLoading();

  const handleSelect = (slug?: string, name?: string) => {
    if (slug === activeCategory) return;
    const url = buildProductsUrl({
      category: slug,
      q: currentQuery,
      sort: currentSort,
    });
    const message = slug ? `Memuat produk ${name}...` : "Memuat semua produk...";
    startTransitionLoading(() => {
      router.push(url);
    }, message);
  };

  return (
    <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
      <button
        type="button"
        onClick={() => handleSelect(undefined)}
        className={cn(
          "cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
          !activeCategory
            ? "bg-espresso-700 text-cream"
            : "bg-white text-espresso-700 hover:bg-latte lg:bg-transparent"
        )}
      >
        Semua Produk
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => handleSelect(c.slug, c.name)}
          className={cn(
            "cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
            activeCategory === c.slug
              ? "bg-espresso-700 text-cream"
              : "bg-white text-espresso-700 hover:bg-latte lg:bg-transparent"
          )}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

export function ProductSortFilter({
  totalCount,
  activeSort,
  activeCategory,
  currentQuery,
}: {
  totalCount: number;
  activeSort: string;
  activeCategory?: string;
  currentQuery?: string;
}) {
  const router = useRouter();
  const { startTransitionLoading } = useAppLoading();

  const handleSort = (sortKey: string, sortLabel: string) => {
    if (sortKey === activeSort) return;
    const url = buildProductsUrl({
      category: activeCategory,
      q: currentQuery,
      sort: sortKey,
    });
    startTransitionLoading(() => {
      router.push(url);
    }, `Menyaring produk: ${sortLabel}...`);
  };

  const handleClearQuery = () => {
    const url = buildProductsUrl({
      category: activeCategory,
      q: undefined,
      sort: activeSort,
    });
    startTransitionLoading(() => {
      router.push(url);
    }, "Menghapus pencarian...");
  };

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-espresso-500">
        <span>{totalCount} produk</span>
        {currentQuery && (
          <button
            type="button"
            onClick={handleClearQuery}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-latte px-3 py-1 text-xs font-medium text-espresso-700 transition hover:bg-espresso-200"
            title="Hapus pencarian"
          >
            &ldquo;{currentQuery}&rdquo; <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {PRODUCT_SORTS.map((s) => {
          const isActive = activeSort === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => handleSort(s.key, s.label)}
              className={cn(
                "cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-latte text-espresso-900 font-semibold"
                  : "text-espresso-500 hover:bg-latte/50 hover:text-espresso-800"
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
