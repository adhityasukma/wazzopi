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

function RouteWatcher({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Route atau query berubah, tutup modal loading
    onNavigate();
  }, [pathname, searchParams, onNavigate]);

  return null;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Memuat data...");
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Timeout pengaman maksimal 12 detik agar modal tidak menggantung jika koneksi bermasalah
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 12000);
  }, []);

  const startTransitionLoading = useCallback(
    (action: () => void, customMessage = "Sedang memuat data...") => {
      showLoading(customMessage);
      startTransition(() => {
        action();
      });
    },
    [showLoading]
  );

  // Pantau useTransition selesai
  useEffect(() => {
    if (!isPending && isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isPending, isLoading]);

  // Listener global untuk elemen dengan atribut `data-loading-message`
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("[data-loading-message]");
      if (target) {
        const msg = target.getAttribute("data-loading-message");
        if (msg) {
          showLoading(msg);
        }
      }
    };

    const handleSubmit = (e: SubmitEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("form[data-loading-message]");
      if (target) {
        const msg = target.getAttribute("data-loading-message");
        if (msg) {
          showLoading(msg);
        }
      }
    };

    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("submit", handleSubmit, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("submit", handleSubmit, { capture: true });
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-espresso-950/65 backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
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
