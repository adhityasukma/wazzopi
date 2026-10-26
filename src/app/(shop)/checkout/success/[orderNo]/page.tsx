import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CheckCircle2, Copy, Package, Store, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, PAYMENT_LABEL } from "@/lib/utils";
import { LinkButton } from "@/components/ui";
import { ClearCartOnSuccess } from "@/components/shop/clear-cart";
import { CopyButton } from "@/components/shop/copy-button";

export const metadata = {
  title: "Terima Kasih Atas Pesanan Anda",
};

export default async function CheckoutSuccessPage({
  params,
}: PageProps<"/checkout/success/[orderNo]">) {
  const { orderNo } = await params;
  const cookieStore = await cookies();

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNo },
      include: { items: true },
    }),
    getSettings(),
  ]);

  if (!order) notFound();

  // Ambil info akun baru jika dibuat otomatis saat checkout
  const newAccountCookie = cookieStore.get("wz_new_account")?.value;
  let newAccount: { email: string; tempPassword: string } | null = null;
  if (newAccountCookie) {
    try {
      newAccount = JSON.parse(newAccountCookie);
    } catch {
      // noop
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <ClearCartOnSuccess />

      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-espresso-900 md:text-4xl">Terima Kasih!</h1>
        <p className="mt-2 text-espresso-600">Pesanan Anda telah berhasil dibuat.</p>
        <p className="mt-1 text-sm font-semibold text-espresso-900">
          Nomor Pesanan: <span className="text-caramel-600">{order.orderNo}</span>
        </p>
      </div>

      {/* Kartu Informasi Akun Member Baru (jika otomatis dibuatkan akun) */}
      {newAccount && (
        <div className="mt-8 rounded-2xl border-2 border-caramel-300 bg-gradient-to-br from-caramel-50/80 via-white to-cream p-6 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-caramel-500 text-white shadow-xs">
              <UserCheck className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-caramel-100 px-2.5 py-0.5 text-[10px] font-bold text-caramel-800 uppercase tracking-wider">
                Akun Member Baru Dibuat
              </span>
              <h2 className="mt-1 text-lg font-bold text-espresso-900">
                Akses Login Member Area Anda
              </h2>
              <p className="mt-1 text-xs text-espresso-600 leading-relaxed">
                Kami telah otomatis membuatkan akun Member agar Anda dapat melacak paket pengiriman dan melihat riwayat belanja. Anda saat ini sudah otomatis masuk (login).
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 rounded-xl border border-latte bg-cream/50 p-4">
                <div>
                  <span className="text-[11px] font-semibold text-espresso-400 uppercase tracking-wider block">
                    Email Akun
                  </span>
                  <p className="mt-0.5 text-sm font-semibold text-espresso-900 font-mono select-all">
                    {newAccount.email}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-espresso-400 uppercase tracking-wider block">
                    Password Sementara
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    <p className="text-sm font-bold text-caramel-700 font-mono tracking-wider bg-white px-2.5 py-1 rounded-md border border-latte select-all">
                      {newAccount.tempPassword}
                    </p>
                    <CopyButton text={newAccount.tempPassword} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
                <Link
                  href="/account"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-espresso-700 px-4 py-2 text-xs font-semibold text-cream hover:bg-espresso-800 transition-colors"
                >
                  Buka Member Area &rarr;
                </Link>
                <span className="text-xs text-espresso-400">
                  *Anda dapat mengganti password ini kapan saja di menu Akun Saya.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instruksi Transfer Bank jika memilih Transfer */}
      {order.paymentMethod === "bank_transfer" && (
        <div className="mt-8 rounded-xl border border-caramel-200 bg-caramel-50/40 p-6">
          <h2 className="text-base font-semibold text-espresso-900">Petunjuk Pembayaran Transfer Bank:</h2>
          <p className="mt-1 text-sm text-espresso-600">
            Silakan lakukan transfer sejumlah{" "}
            <strong className="text-espresso-900">
              {formatCurrency(order.total, settings.currency)}
            </strong>{" "}
            ke salah satu rekening resmi Wazzopi di bawah ini:
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {settings.payment.bankTransfer.accounts.map((acc, i) => (
              <div key={i} className="rounded-lg border border-caramel-200 bg-white p-4 shadow-xs">
                <span className="text-xs font-semibold uppercase text-caramel-600">{acc.bank}</span>
                <p className="mt-1 font-mono text-lg font-bold tracking-wider text-espresso-900">
                  {acc.number}
                </p>
                <p className="text-xs text-espresso-500">a.n. {acc.holder}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-espresso-500">
            *Konfirmasi bukti transfer ke WhatsApp admin kami{" "}
            {settings.other.whatsapp && (
              <a
                href={`https://wa.me/${settings.other.whatsapp}?text=Halo%20Admin%20Wazzopi,%20saya%20sudah%20transfer%20untuk%20pesanan%20${order.orderNo}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-caramel-600 underline"
              >
                (+{settings.other.whatsapp})
              </a>
            )}
          </p>
        </div>
      )}

      {/* Rincian Pesanan */}
      <div className="mt-8 rounded-xl border border-latte bg-white p-6 shadow-sm">
        <h2 className="border-b border-latte pb-4 text-lg font-semibold text-espresso-900">Detail Pesanan</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-espresso-500">Tanggal Pesan</span>
            <span className="font-medium text-espresso-900">{formatDate(order.createdAt, true)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-espresso-500">Status Pesanan</span>
            <span className="font-medium text-espresso-900">{ORDER_STATUS_LABEL[order.status]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-espresso-500">Metode Pengiriman</span>
            <span className="font-medium text-espresso-900">{order.shippingMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-espresso-500">Metode Pembayaran</span>
            <span className="font-medium text-espresso-900">{PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-espresso-500">Alamat Pengiriman</span>
            <span className="max-w-xs text-right font-medium text-espresso-900">
              {order.address}, {order.city}, {order.province} {order.postalCode}
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-latte pt-4">
          <h3 className="mb-3 text-sm font-semibold text-espresso-900">Produk yang Dibeli</h3>
          <div className="divide-y divide-latte">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium text-espresso-900">{it.productName}</p>
                  {it.variantName && (
                    <p className="text-xs text-espresso-500">Varian: {it.variantName}</p>
                  )}
                  <p className="text-xs text-espresso-400">
                    {it.quantity} x {formatCurrency(it.price, settings.currency)}
                  </p>
                </div>
                <span className="font-semibold text-espresso-900">
                  {formatCurrency(it.total, settings.currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-latte pt-3 text-sm">
            <div className="flex justify-between text-espresso-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal, settings.currency)}</span>
            </div>
            <div className="flex justify-between text-espresso-600">
              <span>Ongkos Kirim</span>
              <span>
                {order.shippingCost === 0 ? "Gratis" : formatCurrency(order.shippingCost, settings.currency)}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-latte pt-2 font-bold text-espresso-900">
              <span>Total Akhir</span>
              <span className="text-xl">{formatCurrency(order.total, settings.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <LinkButton href="/products" variant="outline" className="justify-center">
          Belanja Produk Lainnya
        </LinkButton>
        <LinkButton href="/account" className="justify-center">
          Lihat Riwayat Pesanan
        </LinkButton>
      </div>
    </div>
  );
}
