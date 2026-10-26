import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan",
  description: "Syarat dan ketentuan pembelian serta penggunaan layanan toko online Wazzopi.",
};

export default async function TermsPage() {
  const settings = await getSettings();
  const g = settings.general;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-6 text-xs text-espresso-400">
        <Link href="/" className="hover:text-caramel-500">
          Beranda
        </Link>{" "}
        / <span className="text-espresso-700">Syarat & Ketentuan</span>
      </nav>

      <div className="rounded-2xl border border-latte bg-white p-6 md:p-10 shadow-xs space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-caramel-50 px-3 py-1 text-xs font-semibold text-caramel-800 mb-3">
            <FileText className="h-3.5 w-3.5" /> Dokumen Resmi
          </div>
          <h1 className="text-3xl font-bold text-espresso-900 md:text-4xl">
            Syarat dan Ketentuan
          </h1>
          <p className="mt-2 text-sm text-espresso-500">
            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">1. Ketentuan Umum</h2>
          <p>
            Selamat datang di <strong>{g.storeName}</strong> ({g.tagline}). Dengan mengakses, menjelajahi, dan melakukan pembelian produk kopi serta perlengkapannya di situs web kami (<strong>https://wazzopi.vercel.app</strong>), Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan yang berlaku di bawah ini.
          </p>
        </section>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">2. Produk dan Harga</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Seluruh produk yang kami tampilkan merupakan produk kopi asli Nusantara berkualitas tinggi, alat seduh, dan merchandise resmi Wazzopi.</li>
            <li>Harga produk yang tercantum menggunakan mata uang sah <strong>Rupiah (IDR)</strong> dan belum termasuk biaya kirim (ongkos kirim) kecuali dinyatakan dalam program promo gratis ongkir.</li>
            <li>Wazzopi berhak memperbarui harga produk dan ketersediaan stok sewaktu-waktu tanpa pemberitahuan sebelumnya.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">3. Pemesanan dan Pembayaran</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Pelanggan wajib mengisi data pemesanan (nama lengkap, nomor telepon aktif/WhatsApp, alamat pengiriman) secara akurat dan lengkap.</li>
            <li>Metode pembayaran resmi yang tersedia di Wazzopi meliputi:
              <ul className="list-circle pl-5 mt-1 space-y-1 text-espresso-600">
                <li><strong>Transfer Bank Manual</strong> (BCA, Mandiri, dan bank rekanan resmi Wazzopi).</li>
                <li><strong>Bayar di Tempat (COD)</strong> untuk area pengiriman yang mendukung kurir COD.</li>
                <li><strong>Payment Gateway Otomatis (Midtrans)</strong>: Mendukung QRIS, GoPay, OVO, ShopeePay, dan Virtual Account (BCA, Mandiri, BNI, BRI, Permata). Seluruh transaksi diproses secara instan dan terenkripsi aman tanpa biaya tersembunyi.</li>
              </ul>
            </li>
            <li>Pesanan akan diproses dan disiapkan untuk pengiriman setelah pembayaran diverifikasi oleh sistem.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">4. Pengiriman Barang</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Pengiriman pesanan dilakukan menggunakan jasa kurir ekspedisi rekanan resmi (seperti JNE, J&T, SiCepat, atau kurir instan).</li>
            <li>Nomor resi pelacakan pengiriman akan diinformasikan kepada pembeli melalui halaman pelacakan pesanan atau WhatsApp.</li>
            <li>Estimasi waktu tiba bergantung pada jarak alamat tujuan serta layanan kurir yang dipilih oleh pelanggan.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">5. Keamanan dan Perlindungan Data</h2>
          <p>
            Wazzopi berkomitmen menjaga kerahasiaan data pribadi pelanggan. Data identitas, nomor kontak, dan alamat Anda hanya digunakan untuk memproses pengiriman pesanan dan verifikasi transaksi, serta tidak akan pernah dijual atau dialihkan kepada pihak ketiga mana pun tanpa izin Anda.
          </p>
        </section>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">6. Kontak Layanan Pelanggan</h2>
          <p>
            Apabila memiliki pertanyaan, bantuan transaksi, atau saran mengenai layanan kami, silakan hubungi tim Wazzopi melalui:
          </p>
          <div className="rounded-xl bg-cream/70 p-4 border border-latte space-y-2 text-xs">
            <p className="flex items-center gap-2 text-espresso-800">
              <MapPin className="h-4 w-4 text-caramel-600 shrink-0" />
              <span><strong>Alamat:</strong> {g.address}, {g.city}, {g.province} {g.postalCode}</span>
            </p>
            <p className="flex items-center gap-2 text-espresso-800">
              <Phone className="h-4 w-4 text-caramel-600 shrink-0" />
              <span><strong>Telepon / WhatsApp:</strong> {g.phone}</span>
            </p>
            <p className="flex items-center gap-2 text-espresso-800">
              <Mail className="h-4 w-4 text-caramel-600 shrink-0" />
              <span><strong>Email Resmi:</strong> {g.email}</span>
            </p>
          </div>
        </section>

        <div className="border-t border-latte pt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-espresso-700 hover:text-caramel-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
