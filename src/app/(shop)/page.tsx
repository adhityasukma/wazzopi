import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, Flame, Leaf, ShieldCheck, Star, Truck } from "lucide-react";
import { HeroSlider } from "@/components/shop/hero-slider";
import { ProductCard } from "@/components/shop/product-card";
import { getProductCards } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";

export default async function HomePage() {
  const [slides, featured, latest, categories, settings] = await Promise.all([
    prisma.heroSlide.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getProductCards({ where: { featured: true }, take: 8, orderBy: { createdAt: "asc" } }),
    getProductCards({ take: 4, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } }, products: { take: 1, select: { image: true }, where: { status: "PUBLISHED" } } },
    }),
    getSettings(),
  ]);

  const features = [
    { icon: Flame, title: "Disangrai Segar", text: "Roasting setiap minggu dalam batch kecil" },
    { icon: Leaf, title: "Langsung dari Petani", text: "Biji pilihan dari kebun Nusantara" },
    {
      icon: Truck,
      title: "Pengiriman Cepat",
      text:
        settings.shipping.freeShippingEnabled && settings.shipping.freeShippingMin > 0
          ? `Gratis ongkir mulai ${formatCurrency(settings.shipping.freeShippingMin, settings.currency)}`
          : "Dikirim ke seluruh Indonesia",
    },
    { icon: ShieldCheck, title: "Transaksi Aman", text: "Pembayaran terverifikasi dan terlindungi" },
  ];

  const testimonials = [
    { name: "Rani Kusuma", city: "Jakarta", text: "Arabica Gayo-nya juara. Aromanya langsung memenuhi ruangan begitu kemasan dibuka. Pengirimannya juga cepat." },
    { name: "Dimas Pratama", city: "Yogyakarta", text: "Espresso Blend Wazzopi jadi andalan untuk latte di rumah. Crema tebal dan rasanya seimbang." },
    { name: "Ayu Lestari", city: "Denpasar", text: "Kemasannya rapi dan informatif. Drip bag-nya praktis sekali untuk dibawa ke kantor." },
  ];

  return (
    <>
      <HeroSlider slides={slides} />

      {/* Features */}
      <section className="border-b border-latte bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-caramel-500">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-espresso-900">{f.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-espresso-400">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <SectionTitle eyebrow="Kategori" title="Temukan Kopi Favoritmu" />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => (
            <Link key={c.id} href={`/products?category=${c.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-latte">
              {(c.image || c.products[0]?.image) && (
                <Image
                  src={(c.image || c.products[0]?.image)!}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/80 via-espresso-900/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
                <p className="font-display text-lg font-medium">{c.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-espresso-100">
                  {c._count.products} produk <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow="Pilihan Kami" title="Produk Unggulan" align="left" />
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-espresso-700 hover:text-caramel-500">
            Lihat semua produk <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Story */}
      <section id="cerita" className="mx-auto max-w-7xl scroll-mt-28 px-4 pt-24">
        <div className="grid items-center gap-10 overflow-hidden rounded-2xl bg-espresso-700 lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[460px]">
            <Image src="/images/story.jpg" alt="Cerita Wazzopi" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="px-6 pb-12 text-cream lg:px-4 lg:py-14 lg:pr-14">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-200">Cerita Kami</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">Satu Teguk, Banyak Cerita</h2>
            <p className="mt-5 leading-relaxed text-espresso-100">
              Wazzopi lahir dari kecintaan pada kopi Nusantara. Kami bekerja langsung bersama petani di Gayo, Toraja, Kintamani, hingga
              Flores untuk menghadirkan biji terbaik, lalu menyangrainya dalam batch kecil agar setiap cangkir terasa segar.
            </p>
            <p className="mt-4 leading-relaxed text-espresso-100">
              Setiap teguk membawa cerita tentang tanah, tangan yang merawat, dan momen yang kamu bagikan bersama orang terdekat.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-espresso-600 pt-8">
              {[
                ["12+", "Origin Nusantara"],
                ["40+", "Mitra Petani"],
                ["5rb+", "Pelanggan Setia"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-semibold text-cream md:text-3xl">{n}</p>
                  <p className="mt-1 text-xs text-espresso-200">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <SectionTitle eyebrow="Terbaru" title="Baru di Wazzopi" />
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Brew steps */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <SectionTitle eyebrow="Panduan" title="Dari Kebun ke Cangkirmu" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { icon: Leaf, title: "Dipetik Selektif", text: "Hanya ceri kopi merah matang yang dipetik oleh petani mitra kami." },
            { icon: Flame, title: "Disangrai Presisi", text: "Profil roasting disesuaikan untuk menonjolkan karakter setiap origin." },
            { icon: Coffee, title: "Diseduh Sepenuh Hati", text: "Sampai di tanganmu dalam kondisi segar, siap menemani setiap cerita." },
          ].map((s, i) => (
            <div key={s.title} className="rounded-xl border border-latte bg-white p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-caramel-500">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-display text-4xl font-semibold text-latte">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-espresso-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-espresso-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <SectionTitle eyebrow="Testimoni" title="Cerita dari Pelanggan" />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-xl bg-latte/60 p-7">
              <div className="flex gap-1 text-caramel-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 leading-relaxed text-espresso-700">&ldquo;{t.text}&rdquo;</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-espresso-700 text-sm font-semibold text-cream">
                  {t.name.split(" ").map((x) => x[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-espresso-900">{t.name}</p>
                  <p className="text-xs text-espresso-400">{t.city}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-latte bg-white px-8 py-12 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-semibold text-espresso-900 md:text-3xl">Gabung Member Wazzopi</h2>
            <p className="mt-2 text-espresso-400">Daftar gratis untuk melacak pesanan dan checkout lebih cepat.</p>
          </div>
          <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-lg bg-espresso-700 px-6 text-sm font-semibold text-cream hover:bg-espresso-800">
            Daftar Sekarang <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-500">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold text-espresso-900 md:text-4xl">{title}</h2>
    </div>
  );
}
