"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  slug: string;
  image: string | null;
  price: number;
  quantity: number;
  maxStock: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "key" | "quantity">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const key = `${item.productId}:${item.variantId ?? "-"}`;
          const existing = s.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.key === key ? { ...i, ...item, quantity: Math.min(i.quantity + qty, item.maxStock) } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, key, quantity: Math.min(qty, item.maxStock) }] };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxStock)) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "wazzopi-cart" },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((a, i) => a + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((a, i) => a + i.price * i.quantity, 0);
