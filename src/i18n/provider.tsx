"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, type Dictionary, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { setLocaleAction } from "@/actions/locale";

type I18nContextType = {
  locale: Locale;
  t: Dictionary;
  isPending: boolean;
  setLocale: (nextLocale: Locale) => void;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSetLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    startTransition(async () => {
      await setLocaleAction(nextLocale);
      router.refresh();
    });
  };

  return (
    <I18nContext.Provider
      value={{
        locale: locale || DEFAULT_LOCALE,
        t: dictionary,
        isPending,
        setLocale: handleSetLocale,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback jika komponen dipanggil tanpa provider
    return {
      locale: DEFAULT_LOCALE,
      t: getDictionary(DEFAULT_LOCALE),
      isPending: false,
      setLocale: () => {},
    };
  }
  return ctx;
}
