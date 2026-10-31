export type Locale = "en" | "id";

export const DEFAULT_LOCALE: Locale = "en";
export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "US" },
  { code: "id", label: "Indonesia", flag: "ID" },
];

export const LOCALE_COOKIE = "wz_lang";

export type Dictionary = typeof import("./dictionaries/en").dictionary;
