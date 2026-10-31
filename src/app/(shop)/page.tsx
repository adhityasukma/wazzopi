import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, Flame, Leaf, ShieldCheck, Star, Truck } from "lucide-react";
import { HeroSlider } from "@/components/shop/hero-slider";
import { ProductCard } from "@/components/shop/product-card";
import { getProductCards } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";
import { getServerDictionary, getServerLocale } from "@/i18n/server";
import { getLocalizedCategoryName } from "@/lib/category-i18n";

export default async function HomePage() {
  const [slides, featured, latest, categories, settings, dict, locale] = await Promise.all([
    prisma.heroSlide.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getProductCards({ where: { featured: true }, take: 8, orderBy: { createdAt: "asc" } }),
    getProductCards({ take: 4, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } }, products: { take: 1, select: { image: true }, where: { status: "PUBLISHED" } } },
    }),
    getSettings(),
    getServerDictionary(),
    getServerLocale(),
  ]);

  const features = [
    {
      icon: Flame,
      title: dict.home.feature1Title,
      text: dict.home.feature1Desc,
    },
    {
      icon: Leaf,
      title: dict.home.feature2Title,
      text: dict.home.feature2Desc,
    },
    {
      icon: Truck,
      title: dict.home.feature3Title,
      text:
        settings.shipping.freeShippingEnabled && settings.shipping.freeShippingMin > 0
          ? locale === "en"
            ? `Free shipping from ${formatCurrency(settings.shipping.freeShippingMin, settings.currency)}`
            : `Gratis ongkir mulai ${formatCurrency(settings.shipping.freeShippingMin, settings.currency)}`
          : locale === "en"
          ? "Worldwide & safe delivery"
          : "Dikirim ke seluruh Indonesia",
    },
    {
      icon: ShieldCheck,
      title: dict.home.feature4Title,
      text: dict.home.feature4Desc,
    },
  ];

  const testimonials = [
    {
      name: "Rani Kusuma",
      city: "Jakarta",
      text:
        locale === "en"
          ? "The Arabica Gayo is simply outstanding. The aroma fills the entire room as soon as you open the pouch. Fast shipping too!"
          : "Arabica Gayo-nya juara. Aromanya langsung memenuhi ruangan begitu kemasan dibuka. Pengirimannya juga cepat.",
    },
    {
      name: "Dimas Pratama",
      city: "Yogyakarta",
      text:
        locale === "en"
          ? "Wazzopi Espresso Blend is my daily go-to for home lattes. Rich crema and perfectly balanced sweet notes."
          : "Espresso Blend Wazzopi jadi andalan untuk latte di rumah. Crema tebal dan rasanya seimbang.",
    },
    {
      name: "Ayu Lestari",
      city: "Denpasar",
      text:
        locale === "en"
          ? "The packaging is sleek and informative. The drip bags are super convenient to take on travels and work."
          : "Kemasannya rapi dan informatif. Drip bag-nya praktis sekali untuk dibawa ke kantor.",
    },
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
        <SectionTitle eyebrow={dict.home.categoriesEyebrow} title={dict.home.categoriesTitle} />
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
                <p className="font-display text-lg font-medium">
                  {getLocalizedCategoryName(c.name, c.slug, locale)}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-espresso-100">
                  {c._count.products} {dict.home.itemsCount} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle eyebrow={dict.home.featuredEyebrow} title={dict.home.featuredTitle} align="left" />
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-espresso-700 hover:text-caramel-500">
            {dict.home.viewAllProducts} <ArrowRight className="h-4 w-4" />
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
            <Image src="/images/story.jpg" alt={dict.home.storyTitle} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="px-6 pb-12 text-cream lg:px-4 lg:py-14 lg:pr-14">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-200">{dict.home.storyEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">{dict.home.storyTitle}</h2>
            <p className="mt-5 leading-relaxed text-espresso-100">
              {dict.home.storyDesc1}
            </p>
            <p className="mt-4 leading-relaxed text-espresso-100">
              {dict.home.storyDesc2}
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-espresso-600 pt-8">
              {[
                [dict.home.storyStat1Num, dict.home.storyStat1Label],
                [dict.home.storyStat2Num, dict.home.storyStat2Label],
                [dict.home.storyStat3Num, dict.home.storyStat3Label],
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
        <SectionTitle eyebrow={dict.home.latestEyebrow} title={dict.home.latestTitle} />
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {latest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Brew steps */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <SectionTitle eyebrow={dict.home.guideEyebrow} title={dict.home.guideTitle} />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { icon: Leaf, title: dict.home.step1Title, text: dict.home.step1Desc },
            { icon: Flame, title: dict.home.step2Title, text: dict.home.step2Desc },
            { icon: Coffee, title: dict.home.step3Title, text: dict.home.step3Desc },
          ].map((s) => (
            <div key={s.title} className="rounded-xl border border-latte bg-white p-7">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-caramel-500">
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 font-display text-lg font-semibold text-espresso-900">{s.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-espresso-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 pt-24">
        <SectionTitle eyebrow={dict.home.testimonialsEyebrow} title={dict.home.testimonialsTitle} />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name} className="flex flex-col justify-between rounded-xl border border-latte bg-white p-7">
              <div className="flex gap-1 text-caramel-500">
                {[...Array(5)].map((_, i) => (
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
            <h2 className="text-2xl font-semibold text-espresso-900 md:text-3xl">
              {locale === "en" ? "Join Wazzopi Membership" : "Gabung Member Wazzopi"}
            </h2>
            <p className="mt-2 text-espresso-400">
              {locale === "en"
                ? "Sign up for free to track your orders and enjoy faster checkout."
                : "Daftar gratis untuk melacak pesanan dan checkout lebih cepat."}
            </p>
          </div>
          <Link
            href="/register"
            className="inline-flex h-12 items-center gap-2 rounded-lg bg-espresso-700 px-6 text-sm font-semibold text-cream hover:bg-espresso-800"
          >
            {locale === "en" ? "Join Now" : "Daftar Sekarang"} <ArrowRight className="h-4 w-4" />
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
