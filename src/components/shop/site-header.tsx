"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LayoutDashboard, Menu, Search, ShoppingBag, Truck, User, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { useHydrated } from "@/components/currency-provider";
import { useAppLoading } from "@/components/loading-provider";
import { cartCount, useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

type Props = {
  user: { name: string; role: string } | null;
  categories: { name: string; slug: string }[];
  announcement: string;
};

export function SiteHeader({ user, categories, announcement }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const count = hydrated ? cartCount(items) : 0;

  const { startTransitionLoading } = useAppLoading();

  const nav = [
    { href: "/", label: "Beranda" },
    { href: "/products", label: "Semua Produk" },
    { href: "/cerita-kami", label: "Cerita Kami" },
  ];

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const val = new FormData(e.currentTarget).get("q");
    const query = String(val || "").trim();
    setSearchOpen(false);
    startTransitionLoading(() => {
      router.push(`/products?q=${encodeURIComponent(query)}`);
    }, query ? `Mencari "${query}"...` : "Memuat semua produk...");
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-espresso-700 text-cream">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-xs tracking-wide">
          <Truck className="h-3.5 w-3.5" />
          <span>{announcement}</span>
        </div>
      </div>
      <div className="border-b border-latte bg-cream/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:h-20">
          <div className="flex items-center gap-2">
            <button className="rounded-lg p-2 text-espresso-700 hover:bg-latte lg:hidden" onClick={() => setOpen(true)} aria-label="Buka menu">
              <Menu className="h-5 w-5" />
            </button>
            <Logo size="md" />
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                data-loading-message={`Membuka ${n.label}...`}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-caramel-500",
                  pathname === n.href ? "text-caramel-500" : "text-espresso-700",
                )}
              >
                {n.label}
              </Link>
            ))}
            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-espresso-700 hover:text-caramel-500">
                Kategori <ChevronDown className="h-4 w-4" />
              </button>
              <div className="invisible absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="rounded-xl border border-latte bg-white p-2 shadow-lg shadow-espresso-900/5">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/products?category=${c.slug}`}
                      data-loading-message={`Memuat produk ${c.name}...`}
                      className="block rounded-lg px-3 py-2 text-sm text-espresso-700 hover:bg-cream"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-1">
            <button onClick={() => setSearchOpen((v) => !v)} className="rounded-lg p-2.5 text-espresso-700 hover:bg-latte" aria-label="Cari">
              <Search className="h-5 w-5" />
            </button>
            {user && user.role !== "CUSTOMER" ? (
              <Link
                href="/admin"
                data-loading-message="Membuka Dashboard Admin..."
                className="rounded-lg p-2.5 text-espresso-700 hover:bg-latte"
                aria-label="Admin panel"
              >
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href={user ? "/account" : "/login"}
                data-loading-message={user ? "Membuka Akun Saya..." : "Membuka Halaman Masuk..."}
                className="flex items-center gap-2 rounded-lg p-2.5 text-espresso-700 hover:bg-latte"
                aria-label="Akun"
              >
                <User className="h-5 w-5" />
                <span className="hidden max-w-28 truncate text-sm font-medium xl:inline">{user ? user.name.split(" ")[0] : "Masuk"}</span>
              </Link>
            )}
            <Link
              href="/cart"
              data-loading-message="Membuka Keranjang Belanja..."
              className="relative rounded-lg p-2.5 text-espresso-700 hover:bg-latte"
              aria-label="Keranjang"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-caramel-500 px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        {searchOpen && (
          <div className="border-t border-latte bg-cream">
            <form onSubmit={onSearch} className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
              <Search className="h-5 w-5 text-espresso-400" />
              <input
                name="q"
                autoFocus
                placeholder="Cari kopi, alat seduh, atau merchandise..."
                className="flex-1 bg-transparent text-base text-espresso-900 placeholder:text-espresso-300 focus:outline-none"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="rounded-lg p-2 hover:bg-latte" aria-label="Tutup">
                <X className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-espresso-900/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85%] flex-col bg-cream p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo size="sm" />
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-latte" aria-label="Tutup menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  data-loading-message={`Membuka ${n.label}...`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 font-medium text-espresso-800 hover:bg-latte"
                >
                  {n.label}
                </Link>
              ))}
              <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-espresso-400">Kategori</p>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  data-loading-message={`Memuat produk ${c.name}...`}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-espresso-700 hover:bg-latte"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
