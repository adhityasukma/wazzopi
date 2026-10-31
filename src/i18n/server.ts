import { DEFAULT_LOCALE, LOCALE_COOKIE, type Dictionary, type Locale } from "./config";
import { dictionary as enDict } from "./dictionaries/en";
import { dictionary as idDict } from "./dictionaries/id";

const dictionaries: Record<Locale, Dictionary> = {
  en: enDict,
  id: idDict,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
}

export async function getServerLocale(): Promise<Locale> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const val = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
    if (val === "id" || val === "en") {
      return val;
    }
  } catch {
    // noop jika dipanggil di luar SSR
  }
  return DEFAULT_LOCALE;
}

export const getLocale = getServerLocale;

export async function getServerDictionary(): Promise<Dictionary> {
  const locale = await getServerLocale();
  return getDictionary(locale);
}
