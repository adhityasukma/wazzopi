"use client";

import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone, AtSign, Globe } from "lucide-react";
import { Logo } from "@/components/logo";
import { useI18n } from "@/i18n/provider";
import { getLocalizedCategoryName } from "@/lib/category-i18n";
import { type AllSettings, getStoreWhatsApp } from "@/lib/settings-types";

export function SiteFooter({ settings, categories }: { settings: AllSettings; categories: { name: string; slug: string }[] }) {
  const g = settings.general;
  const o = settings.other;
  const waPhone = getStoreWhatsApp(settings);
  const { t, locale } = useI18n();

  return (
    <footer className="mt-24 bg-espresso-800 text-espresso-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light size="md" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-espresso-200">
            {g.storeName} — {g.tagline}. {locale === "en" ? "Artisan coffee beans roasted fresh weekly." : "Kopi pilihan Nusantara yang disangrai segar setiap minggu."}
          </p>
          <div className="mt-5 flex gap-2">
            {o.instagram && (
              <a href={o.instagram} target="_blank" rel="noreferrer" className="rounded-lg border border-espresso-600 p-2 hover:bg-espresso-700" aria-label="Instagram">
                <AtSign className="h-4 w-4" />
              </a>
            )}
            {o.facebook && (
              <a href={o.facebook} target="_blank" rel="noreferrer" className="rounded-lg border border-espresso-600 p-2 hover:bg-espresso-700" aria-label="Facebook">
                <Globe className="h-4 w-4" />
              </a>
            )}
            {waPhone && (
              <a
                href={`https://wa.me/${waPhone}?text=Halo%20Admin%20${encodeURIComponent(g.storeName)},%20saya%20ingin%20bertanya%20seputar%20produk.`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-espresso-600 p-2 hover:bg-espresso-700 transition-colors"
                aria-label="WhatsApp"
                title={t.footer.chatWhatsApp}
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">{t.footer.shopHeading}</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/products" className="hover:text-white">{t.common.allProducts}</Link></li>
            <li><Link href="/cerita-kami" className="hover:text-white">{t.common.ourStory}</Link></li>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-white">
                  {getLocalizedCategoryName(c.name, c.slug, locale)}
                </Link>
              </li>
            ))}
            <li className="pt-2 border-t border-espresso-700">
              <Link href="/syarat-ketentuan" className="hover:text-white">
                {t.common.terms}
              </Link>
            </li>
            <li>
              <Link href="/kebijakan-pengembalian" className="hover:text-white">
                {t.common.privacy}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">{t.footer.accountHeading}</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/login" className="hover:text-white">{t.common.login}</Link></li>
            <li><Link href="/register" className="hover:text-white">{t.common.register}</Link></li>
            <li><Link href="/account" className="hover:text-white">{t.account.title}</Link></li>
            <li><Link href="/cart" className="hover:text-white">{t.common.cart}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-cream">{t.footer.visitUsHeading}</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-caramel-300" />
              {g.mapUrl ? (
                <a
                  href={g.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream transition-colors underline-offset-2 hover:underline"
                  title="Buka lokasi di Google Maps"
                >
                  {g.address}, {g.city}, {g.province} {g.postalCode}
                </a>
              ) : (
                <span>
                  {g.address}, {g.city}, {g.province} {g.postalCode}
                </span>
              )}
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-caramel-300" />
              <a
                href={`tel:${g.phone.replace(/[^0-9+]/g, "")}`}
                className="hover:text-cream transition-colors underline-offset-2 hover:underline"
              >
                {g.phone}
              </a>
            </li>
            {waPhone && (
              <li className="flex gap-3">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-caramel-300" />
                <a
                  href={`https://wa.me/${waPhone}?text=Halo%20Admin%20${encodeURIComponent(g.storeName)},%20saya%20ingin%20bertanya%20seputar%20produk.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream transition-colors underline-offset-2 hover:underline"
                >
                  WhatsApp: +{waPhone}
                </a>
              </li>
            )}
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-caramel-300" />
              <a
                href={`mailto:${g.email}`}
                className="hover:text-cream transition-colors underline-offset-2 hover:underline"
              >
                {g.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-caramel-300" />
              <span>{g.openingHours || "Setiap hari, 08.00 - 22.00"}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-espresso-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-espresso-300 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {g.storeName}. Hak cipta dilindungi.</p>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <Link href="/syarat-ketentuan" className="hover:text-cream transition-colors underline-offset-2 hover:underline">
              Syarat & Ketentuan
            </Link>
            <span>&bull;</span>
            <Link href="/kebijakan-pengembalian" className="hover:text-cream transition-colors underline-offset-2 hover:underline">
              Kebijakan Pengembalian Dana & Produk
            </Link>
          </div>
          <p>{g.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
