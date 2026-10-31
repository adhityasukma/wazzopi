import type { Locale } from "@/i18n/config";

const categoryTranslations: Record<string, { en: string; id: string }> = {
  "coffee-beans": { en: "Coffee Beans", id: "Biji Kopi" },
  "biji-kopi": { en: "Coffee Beans", id: "Biji Kopi" },
  "ground-coffee": { en: "Ground Coffee", id: "Kopi Bubuk" },
  "kopi-bubuk": { en: "Ground Coffee", id: "Kopi Bubuk" },
  "cold-brew": { en: "Cold Brew & Drinks", id: "Kopi Siap Minum" },
  "kopi-siap-minum": { en: "Cold Brew & Drinks", id: "Kopi Siap Minum" },
  "brewing-gear": { en: "Brewing Gear", id: "Alat Seduh" },
  "alat-seduh": { en: "Brewing Gear", id: "Alat Seduh" },
  "merchandise": { en: "Merchandise", id: "Merchandise" },
};

export function getLocalizedCategoryName(
  name: string,
  slug?: string,
  locale: Locale = "en"
): string {
  if (slug) {
    const normalizedSlug = slug.toLowerCase().trim();
    if (categoryTranslations[normalizedSlug]) {
      return categoryTranslations[normalizedSlug][locale];
    }
  }
  const normalizedName = name.toLowerCase().trim();
  for (const item of Object.values(categoryTranslations)) {
    if (
      item.en.toLowerCase() === normalizedName ||
      item.id.toLowerCase() === normalizedName
    ) {
      return item[locale];
    }
  }
  return name;
}
