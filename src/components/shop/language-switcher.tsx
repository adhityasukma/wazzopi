"use client";

import { Globe } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "header" | "pill" | "compact";
};

export function LanguageSwitcher({ className, variant = "header" }: Props) {
  const { locale, setLocale, isPending } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-latte bg-white/80 p-0.5 text-xs font-semibold shadow-2xs backdrop-blur-xs",
        isPending && "opacity-60 pointer-events-none",
        className
      )}
      title="Switch Language / Ganti Bahasa"
    >
      <div className="flex items-center gap-1 px-1.5 text-espresso-400">
        <Globe className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-0.5">
        {SUPPORTED_LOCALES.map((item) => {
          const isActive = locale === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLocale(item.code)}
              disabled={isPending}
              className={cn(
                "rounded-md px-2 py-1 transition-all duration-150 uppercase tracking-wider text-[11px]",
                isActive
                  ? "bg-caramel-600 text-white font-bold shadow-2xs"
                  : "text-espresso-600 hover:text-espresso-900 hover:bg-caramel-50"
              )}
            >
              {item.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
