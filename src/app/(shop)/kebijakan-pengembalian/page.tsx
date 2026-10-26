import type { Metadata } from "next";
import Link from "next/link";
import { RefreshCcw, ArrowLeft, Mail, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian Dana & Produk",
  description: "Kebijakan retur barang, klaim garansi, dan pengembalian dana (refund) toko online Wazzopi.",
};

export default async function ReturnPolicyPage() {
  const settings = await getSettings();
  const g = settings.general;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-6 text-xs text-espresso-400">
        <Link href="/" className="hover:text-caramel-500">
          Beranda
        </Link>{" "}
        / <span className="text-espresso-700">Kebijakan Pengembalian</span>
      </nav>

      <div className="rounded-2xl border border-latte bg-white p-6 md:p-10 shadow-xs space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-caramel-50 px-3 py-1 text-xs font-semibold text-caramel-800 mb-3">
            <RefreshCcw className="h-3.5 w-3.5" /> Jaminan Kepuasan Pelanggan
          </div>
          <h1 className="text-3xl font-bold text-espresso-900 md:text-4xl">
            Kebijakan Pengembalian & Garansi
          </h1>
          <p className="mt-2 text-sm text-espresso-500">
            Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">1. Komitmen Kepuasan Kami</h2>
          <p>
            Di <strong>{g.storeName}</strong>, kepuasan dan kenikmatan seduhan kopi Anda adalah prioritas utama kami. Kami selalu memastikan setiap kemasan kopi disangrai segar dan dikemas dengan standar higienis terbaik. Namun jika Anda menerima produk yang tidak sesuai atau mengalami kerusakan selama proses pengiriman, kami menyediakan solusi pengembalian produk atau pengembalian dana (refund) secara transparan dan mudah.
          </p>
        </section>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">2. Syarat Pengajuan Pengembalian (Retur)</h2>
          <p>Produk dapat diajukan untuk pengembalian atau penggantian baru apabila:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Produk Rusak / Cacat Kemasan:</strong> Kemasan luar robek atau kemasan vakum kopi bocor parah saat pertama kali diterima akibat kelalaian kurir.</li>
            <li><strong>Pesanan Salah Kirim:</strong> Varian produk, ukuran gramasi, atau jenis gilingan (biji utuh / bubuk) yang diterima tidak sesuai dengan detail pesanan Anda.</li>
            <li><strong>Produk Kurang:</strong> Terdapat barang yang tertinggal dalam paket pengiriman.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">3. Batas Waktu & Bukti Klaim</h2>
          <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" /> Ketentuan Klaim Garansi:
            </p>
            <p>
              Pengajuan komplain atau retur wajib disampaikan maksimal <strong>2 x 24 jam</strong> sejak paket dinyatakan berstatus <em>Diterima (Delivered)</em> oleh pihak kurir pengiriman.
            </p>
            <p>
              Pelanggan diharapkan melampirkan foto resi pengiriman dan video pembukaan paket (<em>unboxing</em>) tanpa jeda sebagai bukti pendukung verifikasi.
            </p>
          </div>
        </section>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">4. Prosedur Pengembalian Dana (Refund)</h2>
          <p>
            Apabila solusi penggantian produk baru tidak memungkinkan (misalnya karena stok produk terkait habis), maka pelanggan berhak mendapatkan pengembalian dana (refund) penuh:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Metode Refund:</strong> Pengembalian dana akan ditransfer langsung ke rekening bank pembeli atau dikembalikan secara otomatis melalui sistem payment gateway Midtrans (sesuai metode pembayaran awal).</li>
            <li><strong>Waktu Pemrosesan:</strong> Proses refund diproses dalam waktu <strong>1 – 3 hari kerja</strong> setelah klaim disetujui oleh tim layanan pelanggan kami.</li>
            <li><strong>Biaya Pengiriman Balik (Ongkir Retur):</strong> Sepenuhnya <strong>ditanggung oleh Wazzopi</strong> jika kesalahan berasal dari pihak kami (salah kirim atau kemasan cacat dari toko).</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm text-espresso-700 leading-relaxed border-t border-latte pt-6">
          <h2 className="text-base font-bold text-espresso-900">5. Cara Mengajukan Klaim</h2>
          <p>
            Untuk mengajukan komplain atau retur, silakan hubungi tim Customer Service Wazzopi melalui salah satu jalur resmi berikut:
          </p>
          <div className="rounded-xl bg-cream/70 p-4 border border-latte space-y-2 text-xs">
            <p className="flex items-center gap-2 text-espresso-800">
              <Phone className="h-4 w-4 text-caramel-600 shrink-0" />
              <span><strong>WhatsApp Customer Service:</strong> {g.phone}</span>
            </p>
            <p className="flex items-center gap-2 text-espresso-800">
              <Mail className="h-4 w-4 text-caramel-600 shrink-0" />
              <span><strong>Email Bantuan:</strong> {g.email}</span>
            </p>
          </div>
          <p className="text-xs text-espresso-500">
            Sebutkan nomor pesanan (No. Order) Anda dan lampirkan bukti foto/video agar tim kami dapat menyelesaikan kendala Anda secepatnya.
          </p>
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
