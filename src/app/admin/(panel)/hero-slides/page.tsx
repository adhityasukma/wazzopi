import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getServerLocale } from "@/i18n/server";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";

export const metadata = {
  title: "Kelola Hero Slide Beranda",
};

export default async function AdminHeroSlidesPage({
  searchParams,
}: PageProps<"/admin/hero-slides">) {
  await requireAdmin();
  const locale = await getServerLocale();
  const isEn = locale === "en";
  const sp = await searchParams;

  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const rawStatus = typeof sp.status === "string" ? sp.status : "active";
  const currentStatus = ["active", "inactive", "all"].includes(rawStatus) ? rawStatus : "active";

  const rawLimit = typeof sp.limit === "string" ? sp.limit : "20";
  const currentLimit = ["20", "50", "100", "all"].includes(rawLimit) ? rawLimit : "20";
  const rawPage = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;

  const where = {
    ...(currentStatus === "active" ? { active: true } : {}),
    ...(currentStatus === "inactive" ? { active: false } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { subtitle: { contains: q } },
            { ctaLabel: { contains: q } },
          ],
        }
      : {}),
  };

  const [totalAllSlides, totalMatching] = await Promise.all([
    prisma.heroSlide.count(),
    prisma.heroSlide.count({ where }),
  ]);

  const pageSize = currentLimit === "all" ? null : parseInt(currentLimit, 10);
  const totalPages = pageSize ? Math.max(1, Math.ceil(totalMatching / pageSize)) : 1;
  const currentPage = Math.min(Math.max(1, isNaN(rawPage) ? 1 : rawPage), totalPages);
  const skip = pageSize ? (currentPage - 1) * pageSize : undefined;
  const take = pageSize || undefined;

  const slides = await prisma.heroSlide.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    skip,
    take,
  });

  // Helper untuk reset pencarian (mengosongkan q, tetap menjaga status & limit)
  function getResetSearchHref() {
    const params = new URLSearchParams();
    if (currentStatus !== "active") params.set("status", currentStatus);
    if (currentLimit !== "20") params.set("limit", currentLimit);
    const qs = params.toString();
    return `/admin/hero-slides${qs ? `?${qs}` : ""}`;
  }

  // Helper untuk filter status slide (menjaga q & limit)
  function getStatusFilterHref(st: "active" | "inactive" | "all") {
    const params = new URLSearchParams();
    if (st !== "active") params.set("status", st);
    if (q) params.set("q", q);
    if (currentLimit !== "20") params.set("limit", currentLimit);
    const qs = params.toString();
    return `/admin/hero-slides${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">
          {isEn ? "Manage Homepage Hero Slides" : "Kelola Hero Slide Beranda"}
        </h1>
        <p className="mt-1 text-sm text-espresso-500">
          {isEn ? `Manage promo texts, slider banner images, action buttons, and toggle homepage slides. Total ${totalAllSlides} slide(s) in system.` : `Atur teks promo, foto banner slider, tombol aksi, serta aktifkan atau nonaktifkan slide yang tampil di beranda. Total ${totalAllSlides} slide di sistem toko.`}
        </p>
      </div>

      {/* Filter Status & Search Bar */}
      <div className="rounded-xl border border-latte bg-white p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <form
          data-loading-message="Mencari slide..."
          className="flex flex-1 items-center gap-2 max-w-md"
        >
          {currentStatus !== "active" && <input type="hidden" name="status" value={currentStatus} />}
          {currentLimit !== "20" && <input type="hidden" name="limit" value={currentLimit} />}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-espresso-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder={isEn ? "Search title or slide button text..." : "Cari judul atau teks tombol slide..."}
              className="w-full rounded-lg border border-espresso-100 bg-white py-2 pl-9 pr-3 text-sm text-espresso-900 placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-caramel-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-espresso-700 px-4 py-2 text-xs font-semibold text-cream hover:bg-espresso-800"
          >
            {isEn ? "Search" : "Cari"}
          </button>
          {q && (
            <Link
              href={getResetSearchHref()}
              data-loading-message="Mereset kata kunci pencarian..."
              className="rounded-lg border border-espresso-200 px-3 py-2 text-xs font-semibold text-espresso-600 hover:bg-espresso-50 transition"
              title="Kosongkan pencarian"
            >
              {isEn ? "Reset" : "Reset"}
            </Link>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={getStatusFilterHref("active")}
            data-loading-message="Menyaring slide aktif..."
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              currentStatus === "active"
                ? "bg-espresso-700 text-cream"
                : "bg-latte text-espresso-800 hover:bg-espresso-200"
            }`}
          >
            {isEn ? "Active (Default)" : "Aktif (Default)"}
          </Link>
          <Link
            href={getStatusFilterHref("inactive")}
            data-loading-message="Menyaring slide tidak aktif..."
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              currentStatus === "inactive"
                ? "bg-espresso-700 text-cream"
                : "bg-latte text-espresso-800 hover:bg-espresso-200"
            }`}
          >
            {isEn ? "Inactive" : "Tidak Aktif"}
          </Link>
          <Link
            href={getStatusFilterHref("all")}
            data-loading-message="Memuat semua slide..."
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              currentStatus === "all"
                ? "bg-espresso-700 text-cream"
                : "bg-latte text-espresso-800 hover:bg-espresso-200"
            }`}
          >
            {isEn ? "All" : "Semua"}
          </Link>

          {(q || currentStatus !== "active") && (
            <Link
              href={currentLimit !== "20" ? `/admin/hero-slides?limit=${currentLimit}` : "/admin/hero-slides"}
              data-loading-message="Mereset semua filter slide..."
              className="rounded-lg border border-dashed border-espresso-300 px-3 py-1.5 text-xs font-medium text-espresso-500 hover:bg-espresso-50 hover:text-espresso-800 transition"
              title="Kembali ke tampilan awal slide aktif"
            >
              {isEn ? "Reset All Filters" : "Reset Semua Filter"}
            </Link>
          )}
        </div>
      </div>

      {/* Komponen HeroSlidesManager dengan Multi-Select, Bulk Delete, Show Data & Pagination */}
      <HeroSlidesManager
        slides={slides}
        totalMatching={totalMatching}
        totalAllSlides={totalAllSlides}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        currentLimit={currentLimit}
        currentStatus={currentStatus}
        searchQuery={q}
      />
    </div>
  );
}
