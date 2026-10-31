"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingBag, SlidersHorizontal } from "lucide-react";
import { useMoney } from "@/components/currency-provider";
import { useI18n } from "@/i18n/provider";
import { getLocalizedCategoryName } from "@/lib/category-i18n";
import { useCart } from "@/store/cart";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  hasVariants: boolean;
  category: string | null;
  maxPrice?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const money = useMoney();
  const { t, locale } = useI18n();
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  function handleAdd() {
    add({
      productId: product.id,
      variantId: null,
      name: product.name,
      variantName: null,
      slug: product.slug,
      image: product.image,
      price: product.price,
      maxStock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group flex flex-col">
      <Link
        href={`/products/${product.slug}`}
        data-loading-message={locale === "en" ? `Opening ${product.name}...` : `Membuka ${product.name}...`}
        className="relative block aspect-square overflow-hidden rounded-xl bg-latte"
      >
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {product.comparePrice && product.comparePrice > product.price && (
          <span className="absolute left-3 top-3 rounded-md bg-caramel-500 px-2 py-1 text-[11px] font-semibold text-white">
            {locale === "en" ? "Save " : "Hemat "}
            {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
          </span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 rounded-md bg-espresso-800 px-2 py-1 text-[11px] font-semibold text-cream">
            {t.common.outOfStock}
          </span>
        )}
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        {product.category && (
          <p className="text-xs font-medium uppercase tracking-wider text-caramel-500">
            {getLocalizedCategoryName(product.category, undefined, locale)}
          </p>
        )}
        <Link
          href={`/products/${product.slug}`}
          data-loading-message={locale === "en" ? `Opening ${product.name}...` : `Membuka ${product.name}...`}
          className="mt-1 line-clamp-2 font-display text-base font-medium text-espresso-900 hover:text-caramel-600"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-semibold text-espresso-800">
            {product.hasVariants && product.maxPrice && product.maxPrice > product.price
              ? `${locale === "en" ? "From " : "Mulai "}${money(product.price)}`
              : money(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-espresso-300 line-through">{money(product.comparePrice)}</span>
          )}
        </div>
        <div className="mt-auto pt-4">
          {product.hasVariants ? (
            <Link
              href={`/products/${product.slug}`}
              data-loading-message={locale === "en" ? `Opening ${product.name}...` : `Membuka varian ${product.name}...`}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-espresso-200 text-sm font-medium text-espresso-800 transition-colors hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream"
            >
              <SlidersHorizontal className="h-4 w-4" /> {t.products.selectVariant}
            </Link>
          ) : (
            <button
              disabled={soldOut}
              onClick={handleAdd}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-espresso-200 text-sm font-medium text-espresso-800 transition-colors hover:border-espresso-700 hover:bg-espresso-700 hover:text-cream disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-espresso-800"
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              {added ? (locale === "en" ? "Added" : "Ditambahkan") : soldOut ? t.common.outOfStock : t.common.addToCart}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
