import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flame, Heart, Leaf, MapPin } from "lucide-react";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  const locale = await getLocale();
  if (locale === "en") {
    return {
      title: "Our Story — Wazzopi",
      description:
        "Discover the journey of Wazzopi, our philosophy of One Sip Endless Stories, and our commitment to sustainable artisan coffee farming.",
    };
  }
  return {
    title: "Cerita Kami — Wazzopi",
    description:
      "Mengenal perjalanan Wazzopi, nilai filosofi Satu Teguk Banyak Cerita, serta komitmen kami terhadap petani kopi Nusantara.",
  };
}

export default async function AboutPage() {
  const locale = await getLocale();
  const isEn = locale === "en";

  const values = isEn
    ? [
        {
          icon: Leaf,
          title: "Sustainable Farmer Partnerships",
          desc: "Working directly with smallholder coffee farmers across remote highland communities to ensure fair pricing and pristine crop quality.",
        },
        {
          icon: Flame,
          title: "Small-Batch Artisan Roasting",
          desc: "Crafted in small, meticulous batches rather than mass production, preserving the distinctive terroir flavor notes of every harvest.",
        },
        {
          icon: Heart,
          title: "Sincerity in Every Sip",
          desc: "For us, coffee is far more than caffeine. It is a conduit for warm conversations, creativity, and lasting human connection.",
        },
      ]
    : [
        {
          icon: Leaf,
          title: "Kemitraan Petani Berkelanjutan",
          desc: "Bekerja sama secara langsung (direct trade) dengan petani lokal di berbagai daerah pelosok Nusantara untuk memastikan harga beli yang adil dan mutu biji kopi terbaik.",
        },
        {
          icon: Flame,
          title: "Artisan Roasting Batch Kecil",
          desc: "Menghindari produksi massal. Setiap batch disangrai secara terukur dan teliti guna mempertahankan karakter unik cita rasa (flavor profile) dari tiap tanah asal.",
        },
        {
          icon: Heart,
          title: "Ketulusan di Setiap Teguk",
          desc: "Bagi kami kopi bukan sekadar minuman pemacu energi, melainkan medium penghubung percakapan hangat, inspirasi, dan cerita antarmanusia.",
        },
      ];

  const origins = isEn
    ? [
        { name: "Gayo Highlands, Aceh", notes: "Winey, Dark Chocolate, Spices", alt: "Elevation 1,400 - 1,700 MASL" },
        { name: "Toraja Sapan, Sulawesi", notes: "Herbal, Caramel, Cinnamon", alt: "Limestone plateau 1,600 - 2,000 MASL" },
        { name: "Kintamani, Bali", notes: "Citrus, Brown Sugar, Bright Acidity", alt: "Mount Batur volcanic slopes 1,200 - 1,500 MASL" },
        { name: "Bajawa, Flores", notes: "Nutty, Milk Chocolate, Floral", alt: "Volcanic valley 1,300 - 1,600 MASL" },
        { name: "West Lampung", notes: "Full Body, Bold, Cocoa Nibs", alt: "Fine Robusta terroir 800 - 1,000 MASL" },
      ]
    : [
        { name: "Gayo, Aceh", notes: "Winey, Dark Chocolate, Spices", alt: "Dataran tinggi 1.400 - 1.700 mdpl" },
        { name: "Toraja Sapan, Sulsel", notes: "Herbal, Caramel, Cinnamon", alt: "Pegunungan kapur 1.600 - 2.000 mdpl" },
        { name: "Kintamani, Bali", notes: "Citrus, Brown Sugar, Bright Acidity", alt: "Lereng Gunung Batur 1.200 - 1.500 mdpl" },
        { name: "Bajawa, Flores", notes: "Nutty, Milk Chocolate, Floral", alt: "Lembah vulkanik 1.300 - 1.600 mdpl" },
        { name: "Lampung Barat", notes: "Full Body, Bold, Cocoa Nibs", alt: "Perkebunan Robusta 800 - 1.000 mdpl" },
      ];

  return (
    <div className="py-12">
      {/* Hero Header */}
      <section className="mx-auto max-w-7xl px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-500">
          {isEn ? "About Wazzopi" : "Tentang Wazzopi"}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-espresso-900 md:text-5xl lg:text-6xl">
          {isEn ? "One Sip, Endless Stories" : "Satu Teguk, Banyak Cerita"}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-espresso-600 md:text-lg">
          {isEn
            ? "Born from a deep passion for fine specialty coffee and heritage terroir. We believe behind every extraordinary cup, there is always a human story worth celebrating."
            : "Lahir dari kecintaan mendalam terhadap kekayaan alam dan budaya Nusantara. Kami percaya bahwa di balik secangkir kopi istimewa, selalu ada cerita manusia yang patut didengar."}
        </p>
      </section>

      {/* Main Story & Image Banner */}
      <section className="mx-auto mt-14 max-w-7xl px-4">
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-espresso-800 text-cream lg:grid-cols-12">
          <div className="relative aspect-[4/3] lg:col-span-6 lg:aspect-auto lg:h-full lg:min-h-[480px]">
            <Image
              src="/images/story.jpg"
              alt={isEn ? "Wazzopi Roastery Journey" : "Perjalanan Roastery Wazzopi"}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="p-8 lg:col-span-6 lg:p-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-caramel-300">
              {isEn ? "Where It All Began" : "Awal Mula Perjalanan"}
            </span>
            <h2 className="mt-3 text-2xl font-bold leading-tight md:text-3xl text-cream">
              {isEn
                ? "Connecting Remote Farms to Your Brew Bar"
                : "Menghubungkan Perkebunan Terpencil ke Meja Seduhmu"}
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-relaxed text-espresso-100">
              {isEn ? (
                <>
                  <p>
                    Wazzopi began with a simple journey wandering through highland coffee plantations across Sumatra and Sulawesi. There, we witnessed firsthand the tireless dedication of smallholder farmers tending each tree with utmost care.
                  </p>
                  <p>
                    Too often, their craftsmanship and hard work never reached coffee lovers in the city. Wazzopi was founded to bridge that gap: preserving bean integrity through artisanal post-harvest processing, and roasting fresh weekly in small batches.
                  </p>
                  <p>
                    Today, every pouch of Wazzopi coffee brings tribute to the rich heritage soils and the farming communities we proudly partner with.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Wazzopi berawal dari perjalanan sederhana menyusuri perkebunan kopi di Sumatra dan Sulawesi. Di sana kami menyaksikan langsung dedikasi luar biasa para petani yang merawat setiap pohon dengan penuh kesabaran.
                  </p>
                  <p>
                    Namun, sering kali cerita dan keringat mereka tidak sampai ke cangkir para penikmat kopi di perkotaan. Wazzopi hadir sebagai jembatan penghubung: menjaga keaslian biji kopi dengan metode pascapanen pilihan, lalu menyangrainya segar setiap minggu.
                  </p>
                  <p>
                    Kini, setiap kemasan kopi Wazzopi yang Anda seduh membawa pesan penghormatan bagi bumi pertiwi dan para petani mitra kami.
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-espresso-700 pt-6">
              <div>
                <p className="font-display text-3xl font-bold text-cream">100%</p>
                <p className="text-xs text-espresso-300">{isEn ? "Specialty Origin" : "Biji Nusantara Asli"}</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-cream">40+</p>
                <p className="text-xs text-espresso-300">{isEn ? "Partner Farmers" : "Petani Mitra"}</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-cream">5,000+</p>
                <p className="text-xs text-espresso-300">{isEn ? "Coffee Lovers" : "Penikmat Setia"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai / Prinsip Wazzopi */}
      <section className="mx-auto mt-24 max-w-7xl px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-500">
            {isEn ? "Core Values" : "Nilai Yang Kami Pegang"}
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-espresso-900 md:text-4xl">
            {isEn ? "Crafted with Principles" : "Prinsip di Setiap Proses"}
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-latte bg-white p-8 shadow-xs transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-caramel-50 text-caramel-600">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-espresso-900">{v.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-espresso-500">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Asal Biji Kopi (Origins) */}
      <section className="mx-auto mt-24 max-w-7xl px-4">
        <div className="rounded-3xl border border-latte bg-cream p-8 md:p-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-caramel-600">
              {isEn ? "Heritage Terroirs" : "Peta Rasa Nusantara"}
            </span>
            <h2 className="mt-2 text-3xl font-semibold text-espresso-900">
              {isEn ? "Featured Single Origins" : "Origin Kopi Pilihan Wazzopi"}
            </h2>
            <p className="mt-3 text-sm text-espresso-600">
              {isEn
                ? "Unique microclimates and volcanic mineral soils shape the distinct tasting profile of every harvest."
                : "Karakter iklim mikro dan ketinggian tanah memberikan keunikan profil rasa yang berbeda pada setiap varietas."}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {origins.map((o) => (
              <div key={o.name} className="rounded-xl border border-latte bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 text-espresso-900">
                  <MapPin className="h-4 w-4 text-caramel-500" />
                  <h4 className="font-semibold text-sm">{o.name}</h4>
                </div>
                <p className="mt-2 text-xs font-medium text-caramel-700">Notes: {o.notes}</p>
                <p className="mt-1 text-[11px] text-espresso-400">{o.alt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Belanja */}
      <section className="mx-auto mt-24 max-w-7xl px-4 text-center">
        <div className="rounded-3xl bg-espresso-700 px-6 py-16 text-cream shadow-md">
          <h2 className="text-3xl font-semibold md:text-4xl">
            {isEn ? "Ready to Find Your Perfect Roast?" : "Siap Menemukan Ceritamu Sendiri?"}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-espresso-100">
            {isEn
              ? "Discover fresh artisan batches and specialty brewing equipment delivered right to your home."
              : "Coba varian biji kopi pilihan atau alat seduh manual favorit kami dan rasakan kehangatannya hari ini."}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/products"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-cream px-6 text-sm font-semibold text-espresso-800 transition-colors hover:bg-white"
            >
              {isEn ? "Explore Catalog" : "Jelajahi Produk Kami"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
