"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useMoney } from "@/components/currency-provider";
import { useI18n } from "@/i18n/provider";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

type Variant = { id: string; name: string; price: number; stock: number };

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    price: number;
    comparePrice: number | null;
    stock: number;
    hasVariants: boolean;
    variants: Variant[];
  };
};

export function AddToCart({ product }: Props) {
  const money = useMoney();
  const { t, locale } = useI18n();
  const add = useCart((s) => s.add);
  const firstAvailable = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState<string | null>(product.hasVariants ? firstAvailable?.id ?? null : null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(() => product.variants.find((v) => v.id === variantId) ?? null, [variantId, product.variants]);
  const price = variant ? variant.price : product.price;
  const stock = product.hasVariants ? variant?.stock ?? 0 : product.stock;
  const soldOut = stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    add(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        name: product.name,
        variantName: variant?.name ?? null,
        slug: product.slug,
        image: product.image,
        price,
        maxStock: stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  }

  return (
    <div>
      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-display text-3xl font-semibold text-espresso-800">{money(price)}</span>
        {product.comparePrice && product.comparePrice > price && (
          <span className="text-base text-espresso-300 line-through">{money(product.comparePrice)}</span>
        )}
      </div>
      <p className={cn("mt-2 text-sm", soldOut ? "text-rose-700" : stock <= 10 ? "text-caramel-600" : "text-emerald-700")}>
        {soldOut
          ? t.common.outOfStock
          : stock <= 10
          ? locale === "en"
            ? `Only ${stock} left`
            : `Sisa ${stock} item`
          : t.common.inStock}
      </p>

      {product.hasVariants && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold text-espresso-900">{t.products.selectVariant}</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock <= 0}
                onClick={() => {
                  setVariantId(v.id);
                  setQty(1);
                }}
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  v.id === variantId
                    ? "border-espresso-700 bg-espresso-700 text-cream"
                    : "border-espresso-100 bg-white text-espresso-700 hover:border-espresso-400",
                )}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-lg border border-espresso-100 bg-white">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-full w-11 items-center justify-center text-espresso-600 hover:text-espresso-900" aria-label="Kurangi">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(stock || 1, q + 1))} className="flex h-full w-11 items-center justify-center text-espresso-600 hover:text-espresso-900" aria-label="Tambah">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-espresso-700 px-6 text-sm font-semibold text-cream transition-colors hover:bg-espresso-800 disabled:cursor-not-allowed disabled:bg-espresso-300 sm:flex-none"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {added ? (locale === "en" ? "Added to Cart" : "Ditambahkan ke Keranjang") : t.common.addToCart}
        </button>
      </div>
      {added && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
          <span>{t.products.addedToCart}</span>
          <Link href="/cart" className="font-semibold underline underline-offset-2">
            {locale === "en" ? "View Cart" : "Lihat Keranjang"}
          </Link>
        </div>
      )}
    </div>
  );
}
