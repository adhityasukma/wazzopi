import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { HeroSlidesManager } from "@/components/admin/hero-slides-manager";

export const metadata = {
  title: "Kelola Hero Slide Beranda",
};

export default async function AdminHeroSlidesPage() {
  await requireAdmin();

  const slides = await prisma.heroSlide.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">Kelola Hero Slide Beranda</h1>
        <p className="mt-1 text-sm text-espresso-500">
          Atur teks promo, foto banner slider, tombol aksi, serta aktifkan atau nonaktifkan slide yang tampil di beranda.
        </p>
      </div>

      <HeroSlidesManager slides={slides} />
    </div>
  );
}
