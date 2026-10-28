import Link from "next/link";
import { Coffee, Home, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan",
};

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-16 text-center">
      <div className="mb-8">
        <Logo size="lg" />
      </div>

      <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-espresso-100 border border-espresso-200/80 shadow-sm">
        <Coffee className="h-12 w-12 text-caramel-600" />
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-caramel-500 font-mono text-xs font-bold text-white shadow-md">
          404
        </div>
      </div>

      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-caramel-600">
        Halaman Tidak Ditemukan
      </span>

      <h1 className="text-3xl font-bold tracking-tight text-espresso-950 sm:text-4xl md:text-5xl">
        Cangkir Kopi Ini Sedang Kosong
      </h1>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-espresso-600 sm:text-base">
        Halaman yang Anda tuju tidak dapat ditemukan atau sudah tidak tersedia di sistem Wazzopi.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-espresso-900 px-5 py-2.5 text-sm font-semibold text-cream shadow-sm hover:bg-espresso-800 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl border border-espresso-200 bg-white px-5 py-2.5 text-sm font-semibold text-espresso-800 shadow-xs hover:bg-espresso-50 transition-colors"
        >
          <ShoppingBag className="h-4 w-4 text-caramel-600" />
          <span>Jelajahi Menu Kopi</span>
        </Link>
      </div>
    </div>
  );
}
