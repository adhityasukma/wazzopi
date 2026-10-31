"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCurrencyConfig, useHydrated, useMoney } from "@/components/currency-provider";
import { useI18n } from "@/i18n/provider";
import { EmptyState, LinkButton } from "@/components/ui";
import { cartCount, cartSubtotal, useCart } from "@/store/cart";

export default function CartPage() {
  const { items, setQty, remove, clear } = useCart();
  const hydrated = useHydrated();
  const money = useMoney();
  const currency = useCurrencyConfig();
  const { t, locale } = useI18n();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-espresso-400">
        {t.common.loading}
      </div>
    );
  }

  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" />}
          title={t.cart.emptyCartTitle}
          description={t.cart.emptyCartSubtitle}
          action={<LinkButton href="/products">{t.common.continueShopping}</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="border-b border-latte pb-6">
        <h1 className="text-3xl font-semibold text-espresso-900 md:text-4xl">{t.cart.pageTitle}</h1>
        <p className="mt-1 text-sm text-espresso-400">
          {locale === "en"
            ? `You have ${count} ${t.cart.itemCount} in your cart.`
            : `Kamu memiliki ${count} ${t.cart.itemCount} di dalam keranjang.`}
        </p>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="divide-y divide-latte rounded-xl border border-latte bg-white">
            {items.map((item) => (
              <div key={item.key} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-latte">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-display font-medium text-espresso-900 hover:text-caramel-600"
                  >
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="text-xs text-espresso-400">Varian: {item.variantName}</p>
                  )}
                  <p className="mt-1 text-sm font-semibold text-espresso-800">{money(item.price)}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex h-9 items-center rounded-lg border border-espresso-100 bg-white">
                    <button
                      onClick={() => setQty(item.key, item.quantity - 1)}
                      className="flex h-full w-8 items-center justify-center text-espresso-600 hover:text-espresso-900"
                      aria-label="Kurangi"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => setQty(item.key, item.quantity + 1)}
                      className="flex h-full w-8 items-center justify-center text-espresso-600 hover:text-espresso-900"
                      aria-label="Tambah"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="w-24 text-right font-display text-sm font-semibold text-espresso-900">
                    {money(item.price * item.quantity)}
                  </div>
                  <button
                    onClick={() => remove(item.key)}
                    className="rounded-lg p-2 text-espresso-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Hapus item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-espresso-600 hover:text-espresso-900"
            >
              <ArrowLeft className="h-4 w-4" /> {t.common.continueShopping}
            </Link>
            <button
              onClick={clear}
              className="text-xs text-rose-600 hover:underline"
            >
              {t.cart.clearCart}
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-espresso-900">{t.cart.orderSummary}</h2>
            <div className="mt-4 space-y-3 border-b border-latte pb-4 text-sm">
              <div className="flex justify-between text-espresso-600">
                <span>{t.common.subtotal}</span>
                <span className="font-medium text-espresso-900">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between text-espresso-400 text-xs">
                <span>{t.common.shipping}</span>
                <span>{locale === "en" ? "Calculated at checkout" : "Dihitung di checkout"}</span>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-semibold text-espresso-900">{t.common.total}</span>
              <span className="font-display text-2xl font-bold text-espresso-900">{money(subtotal)}</span>
            </div>
            <LinkButton href="/checkout" className="mt-6 w-full justify-center">
              {t.cart.checkoutButton} <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
