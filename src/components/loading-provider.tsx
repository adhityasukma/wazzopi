"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
  useCallback,
  useRef,
  Suspense,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

type LoadingContextType = {
  isLoading: boolean;
  message: string;
  showLoading: (customMessage?: string) => void;
  hideLoading: () => void;
  startTransitionLoading: (action: () => void, customMessage?: string) => void;
};

const LoadingContext = createContext<LoadingContextType>({
  isLoading: false,
  message: "Memuat data...",
  showLoading: () => {},
  hideLoading: () => {},
  startTransitionLoading: () => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

// Pemetaan cerdas URL ke pesan preloader informatif
function getLoadingMessageForHref(href: string, elementText?: string): string {
  try {
    const url = new URL(href, window.location.href);
    const pathname = url.pathname;
    const searchParams = url.searchParams;

    // Rute Administrator
    if (pathname === "/admin") return "Membuka Dashboard Admin...";
    if (pathname === "/admin/hero-slides") return "Membuka Kelola Hero Slide (Banner)...";
    if (pathname === "/admin/products/new") return "Membuka Form Tambah Produk...";
    if (pathname.startsWith("/admin/products/") && pathname !== "/admin/products") {
      return "Membuka Form Edit Produk...";
    }
    if (pathname === "/admin/products") {
      if (searchParams.has("category")) return "Menyaring produk admin...";
      if (searchParams.has("q")) return `Mencari "${searchParams.get("q")}"...`;
      return "Membuka Kelola Produk...";
    }
    if (pathname.startsWith("/admin/categories")) return "Membuka Kelola Kategori...";
    if (pathname.startsWith("/admin/orders/") && pathname !== "/admin/orders") {
      return "Membuka Rincian Pesanan...";
    }
    if (pathname === "/admin/orders") {
      if (searchParams.has("status")) return "Menyaring daftar pesanan...";
      if (searchParams.has("q")) return `Mencari pesanan "${searchParams.get("q")}"...`;
      return "Membuka Kelola Pesanan...";
    }
    if (pathname.startsWith("/admin/customers")) return "Membuka Data Pelanggan...";
    if (pathname.startsWith("/admin/reports")) return "Membuka Laporan Penjualan...";
    if (pathname.startsWith("/admin/settings")) return "Membuka Pengaturan Toko...";
    if (pathname.startsWith("/admin/login")) return "Membuka Halaman Masuk Admin...";

    // Rute Publik Toko
    if (pathname === "/") return "Membuka Beranda Wazzopi...";
    if (pathname === "/cerita-kami") return "Membuka Cerita Kami...";
    if (pathname === "/cart") return "Membuka Keranjang Belanja...";
    if (pathname === "/checkout") return "Membuka Halaman Pembayaran...";
    if (pathname.startsWith("/checkout/success")) return "Memuat konfirmasi pesanan...";
    if (pathname.startsWith("/products/")) return "Membuka Detail Produk...";
    if (pathname === "/products") {
      if (searchParams.has("sort")) return "Menyaring katalog produk...";
      if (searchParams.has("category")) return "Memuat kategori produk...";
      if (searchParams.has("q")) return `Mencari "${searchParams.get("q")}"...`;
      return "Membuka Katalog Produk...";
    }
    if (pathname === "/account") return "Membuka Akun Saya...";
    if (pathname === "/login") return "Membuka Halaman Masuk...";
    if (pathname === "/register") return "Membuka Halaman Registrasi...";

    // Jika ada teks singkat pada elemen link
    const cleanText = elementText?.replace(/\s+/g, " ").trim();
    if (cleanText && cleanText.length > 1 && cleanText.length <= 35) {
      return `Membuka ${cleanText}...`;
    }

    return "Memuat halaman...";
  } catch {
    return "Memuat halaman...";
  }
}

// Memantau perubahan rute aktual dan menutup preloader saat halaman tujuan sudah dirender
function RouteWatcher({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentKey = `${pathname}?${searchParams.toString()}`;
  const prevKeyRef = useRef<string>(currentKey);

  useEffect(() => {
    if (prevKeyRef.current !== currentKey) {
      prevKeyRef.current = currentKey;
      onNavigate();
    }
  }, [currentKey, onNavigate]);

  return null;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Memuat data...");
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionActiveRef = useRef(false);

  const hideLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
  }, []);

  const showLoading = useCallback((customMessage = "Sedang memproses...") => {
    setMessage(customMessage);
    setIsLoading(true);

    // Timeout pengaman maksimal 12 detik agar tidak terkunci jika server timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 12000);
  }, []);

  const startTransitionLoading = useCallback(
    (action: () => void, customMessage = "Sedang memuat data...") => {
      transitionActiveRef.current = true;
      showLoading(customMessage);
      startTransition(() => {
        action();
      });
    },
    [showLoading]
  );

  // Pantau useTransition selesai HANYA jika dipicu secara eksplisit oleh startTransitionLoading
  useEffect(() => {
    if (transitionActiveRef.current && !isPending) {
      transitionActiveRef.current = false;
      hideLoading();
    }
  }, [isPending, hideLoading]);

  // Listener universal untuk klik navigasi rute/menu & form submit
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Abaikan jika bukan klik kiri biasa atau ditekan bersama tombol modifier
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // JANGAN PERNAH picu preloader jika klik terjadi pada elemen input form (input, textarea, select, dsb.)
      if (target.closest("input, textarea, select, option, label")) {
        return;
      }

      const anchor = target.closest("a");

      // 1. Jika yang diklik adalah link <a> (navigasi perpindahan rute)
      if (anchor) {
        // Abaikan target="_blank" atau link download
        if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

        const rawHref = anchor.getAttribute("href");
        if (
          !rawHref ||
          rawHref === "#" ||
          rawHref.startsWith("#") ||
          rawHref.startsWith("mailto:") ||
          rawHref.startsWith("tel:") ||
          rawHref.startsWith("javascript:")
        ) {
          return;
        }

        // Pastikan URL internal satu origin
        let targetUrl: URL;
        try {
          targetUrl = new URL(rawHref, window.location.href);
        } catch {
          return;
        }

        if (targetUrl.origin !== window.location.origin) {
          return;
        }

        // Jika URL tujuan sama persis dengan halaman saat ini, jangan munculkan modal
        const currentFull = window.location.pathname + window.location.search;
        const targetFull = targetUrl.pathname + targetUrl.search;
        if (currentFull === targetFull) {
          return;
        }

        // Ambil pesan dari data-loading-message atau pemetaan URL otomatis
        const explicitElement = target.closest("[data-loading-message]");
        const msg =
          explicitElement?.getAttribute("data-loading-message") ||
          getLoadingMessageForHref(rawHref, anchor.innerText?.trim());

        showLoading(msg);
        return;
      }

      // 2. Jika bukan link <a>, HANYA proses tombol non-submit mandiri yang memiliki data-loading-message
      // (Catatan: Form dan tombol submit form HANYA ditangani oleh event listener `submit`, bukan `click`)
      const explicitBtn = target.closest("button[data-loading-message]");
      if (explicitBtn) {
        const btnType = (explicitBtn as HTMLButtonElement).type;
        // Jika tombol berada di dalam form dan bertipe "submit", biarkan event handleSubmit yang mengeksekusi
        if (btnType === "submit" && explicitBtn.closest("form")) {
          return;
        }
        const msg = explicitBtn.getAttribute("data-loading-message");
        if (msg) {
          showLoading(msg);
        }
      }
    };

    const handleSubmit = (e: SubmitEvent) => {
      // Jika event submit dibatalkan (misal oleh confirm dialog user), jangan tampilkan preloader
      if (e.defaultPrevented) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const form = target.closest("form");
      if (!form) return;

      // Abaikan form yang mengelola loading/validasi secara manual
      if (
        form.hasAttribute("data-no-loading") ||
        form.hasAttribute("data-skip-loading") ||
        (e.submitter && (
          (e.submitter as HTMLElement).hasAttribute("data-no-loading") ||
          (e.submitter as HTMLElement).hasAttribute("data-skip-loading")
        ))
      ) {
        return;
      }

      // Cek data-loading-message di form
      const formMsg = form.getAttribute("data-loading-message");
      if (formMsg) {
        showLoading(formMsg);
        return;
      }

      // Cek data-loading-message di tombol submit
      const submitter = e.submitter as HTMLElement | null;
      if (submitter) {
        const btnMsg = submitter.getAttribute("data-loading-message");
        if (btnMsg) {
          showLoading(btnMsg);
          return;
        }
      }

      showLoading("Sedang memproses permintaan...");
    };

    const handlePopState = () => {
      showLoading("Memuat halaman...");
    };

    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("submit", handleSubmit, { capture: true });
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("submit", handleSubmit, { capture: true });
      window.removeEventListener("popstate", handlePopState);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showLoading]);

  const active = isLoading || isPending;

  return (
    <LoadingContext.Provider
      value={{
        isLoading: active,
        message,
        showLoading,
        hideLoading,
        startTransitionLoading,
      }}
    >
      <Suspense fallback={null}>
        <RouteWatcher onNavigate={hideLoading} />
      </Suspense>
      {children}
      <PreloaderModal isOpen={active} message={message} />
    </LoadingContext.Provider>
  );
}

export function useAppLoading() {
  return useContext(LoadingContext);
}

function PreloaderModal({ isOpen, message }: { isOpen: boolean; message: string }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-espresso-950/65 backdrop-blur-xs transition-opacity duration-200 animate-fade-in pointer-events-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex flex-col items-center justify-center rounded-2xl border border-latte bg-cream px-8 py-7 shadow-2xl shadow-espresso-950/40 min-w-72 max-w-sm text-center">
        {/* Logo Mark Wazzopi dengan Efek Mengapung */}
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-latte/70 p-2.5 shadow-inner">
          <Image
            src="/logo-mark.png"
            alt="Wazzopi"
            width={44}
            height={44}
            className="animate-pulse object-contain"
            priority
          />
        </div>

        {/* Spinner Elegan */}
        <div className="flex items-center gap-2 text-caramel-600">
          <Loader2 className="h-5 w-5 animate-spin text-caramel-600" />
          <span className="font-display font-semibold text-espresso-900 text-sm tracking-wide">
            Wazzopi
          </span>
        </div>

        {/* Pesan Dinamis */}
        <p className="mt-2.5 text-xs font-medium text-espresso-600 leading-relaxed max-w-xs">
          {message}
        </p>

        {/* Progress Bar Aksen Kopi */}
        <div className="mt-4 h-1 w-36 overflow-hidden rounded-full bg-latte">
          <div className="h-full w-full bg-gradient-to-r from-espresso-700 via-caramel-500 to-espresso-700 animate-progress" />
        </div>
      </div>
    </div>
  );
}
