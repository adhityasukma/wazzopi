import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getStoreWhatsApp } from "@/lib/settings-types";
import { getServerLocale } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  if (locale === "en") {
    return {
      title: "Terms and Conditions — Wazzopi",
      description: "Terms and conditions for purchases and services at Wazzopi online store.",
    };
  }
  return {
    title: "Syarat dan Ketentuan — Wazzopi",
    description: "Syarat dan ketentuan pembelian serta penggunaan layanan toko online Wazzopi.",
  };
}

export default async function TermsPage() {
  const [settings, locale] = await Promise.all([
    getSettings(),
    getServerLocale(),
  ]);
  const isEn = locale === "en";
  const g = settings.general;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-6 text-xs text-espresso-400">
        <Link href="/" className="hover:text-caramel-500">
          {isEn ? "Home" : "Beranda"}
        </Link>{" "}
        / <span className="text-espresso-700">{isEn ? "Terms & Conditions" : "Syarat & Ketentuan"}</span>
      </nav>

      <div className="rounded-2xl border border-latte bg-white p-6 md:p-10 shadow-xs space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-caramel-50 px-3 py-1 text-xs font-semibold text-caramel-800 mb-3">
            <FileText className="h-3.5 w-3.5" /> {isEn ? "Official Agreement" : "Dokumen Resmi"}
          </div>
          <h1 className="text-3xl font-bold text-espresso-900 md:text-4xl">
            {isEn ? "Terms and Conditions" : "Syarat dan Ketentuan"}
          </h1>
          <p className="mt-2 text-sm text-espresso-500">
            {isEn ? "Last updated: " : "Terakhir diperbarui: "}
            {new Date().toLocaleDateString(isEn ? "en-US" : "id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {isEn ? (
          <>
            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">1. General Provisions</h2>
              <p>
                Welcome to <strong>{g.storeName}</strong> ({g.tagline}). By accessing, browsing, and purchasing specialty coffee products and brewing gear through our online platform, you agree to comply with and be bound by the following Terms and Conditions.
              </p>
            </section>

            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">2. Products & Roast Freshness</h2>
              <p>
                All coffee beans offered by {g.storeName} are 100% genuine specialty grade and roasted in small artisan batches. Tasting notes, altitude, and processing methods are provided as accurate sensory references. Variations in grind size depend on your chosen brew method.
              </p>
            </section>

            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">3. Orders & Payment Gateways</h2>
              <p>
                Orders are confirmed upon successful payment verification through our integrated payment systems (Stripe credit cards, PayPal, Midtrans, or direct bank transfer). Unpaid orders will expire automatically after the specified checkout payment window.
              </p>
            </section>

            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">4. Shipping & Delivery</h2>
              <p>
                Fresh batches are dispatched on business days. Tracking waybills are automatically generated and linked to our live courier tracking system. Delivery times vary by destination and selected courier tier.
              </p>
            </section>

            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">5. Contact Information</h2>
              <div className="rounded-xl bg-cream/70 p-4 border border-latte space-y-2 text-xs">
                <p className="flex items-center gap-2 text-espresso-800">
                  <MapPin className="h-4 w-4 text-caramel-600 shrink-0" />
                  <span><strong>Store Address:</strong> {g.address}, {g.city}</span>
                </p>
                <p className="flex items-center gap-2 text-espresso-800">
                  <Phone className="h-4 w-4 text-caramel-600 shrink-0" />
                  <span><strong>WhatsApp Support:</strong> +{getStoreWhatsApp(settings)}</span>
                </p>
                <p className="flex items-center gap-2 text-espresso-800">
                  <Mail className="h-4 w-4 text-caramel-600 shrink-0" />
                  <span><strong>Email:</strong> {g.email}</span>
                </p>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">1. Ketentuan Umum</h2>
              <p>
                Selamat datang di <strong>{g.storeName}</strong> ({g.tagline}). Dengan mengakses, menjelajahi, dan melakukan pembelian produk kopi serta perlengkapannya di situs web kami, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan yang berlaku di bawah ini.
              </p>
            </section>

            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">2. Produk & Kesegaran Sangrai</h2>
              <p>
                Seluruh biji kopi yang disediakan oleh {g.storeName} merupakan 100% kopi murni pilihan artisan grade yang disangrai segar. Deskripsi profil rasa, proses pascapanen, dan asal kebun disajikan secara transparan sebagai panduan cita rasa seduhan Anda.
              </p>
            </section>

            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">3. Pemesanan & Pembayaran</h2>
              <p>
                Pesanan dinyatakan sah setelah pembayaran terverifikasi otomatis oleh sistem (melalui Stripe, PayPal, Midtrans, atau konfirmasi transfer bank). Pesanan yang tidak diselesaikan dalam batas waktu pembayaran otomatis kedaluwarsa.
              </p>
            </section>

            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">4. Pengiriman & Pelacakan</h2>
              <p>
                Pengiriman diproses setiap hari kerja. Resi resmi kurir diterbitkan dan dapat dilacak langsung secara berkala melalui sistem pelacakan otomatis kami.
              </p>
            </section>

            <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
              <h2 className="text-base font-bold text-espresso-900">5. Layanan Kontak</h2>
              <div className="rounded-xl bg-cream/70 p-4 border border-latte space-y-2 text-xs">
                <p className="flex items-center gap-2 text-espresso-800">
                  <MapPin className="h-4 w-4 text-caramel-600 shrink-0" />
                  <span><strong>Alamat:</strong> {g.address}, {g.city}</span>
                </p>
                <p className="flex items-center gap-2 text-espresso-800">
                  <Phone className="h-4 w-4 text-caramel-600 shrink-0" />
                  <span><strong>WhatsApp:</strong> +{getStoreWhatsApp(settings)}</span>
                </p>
                <p className="flex items-center gap-2 text-espresso-800">
                  <Mail className="h-4 w-4 text-caramel-600 shrink-0" />
                  <span><strong>Email:</strong> {g.email}</span>
                </p>
              </div>
            </section>
          </>
        )}

        <div className="border-t border-latte pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-espresso-700 hover:text-caramel-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {isEn ? "Back to Home" : "Kembali ke Beranda"}
          </Link>
        </div>
      </div>
    </div>
  );
}
