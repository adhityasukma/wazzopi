import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Copy, CreditCard, Package, Store, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getStoreWhatsApp } from "@/lib/settings-types";
import { formatCurrency } from "@/lib/currency";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, PAYMENT_LABEL } from "@/lib/utils";
import { isMidtransPayment } from "@/lib/midtrans-channels";
import { LinkButton } from "@/components/ui";
import { ClearCartOnSuccess } from "@/components/shop/clear-cart";
import { CopyButton } from "@/components/shop/copy-button";
import { MidtransPayButton } from "@/components/shop/midtrans-pay-button";
import { OrderTrackingModal } from "@/components/shop/order-tracking-modal";
import { ResendEmailButton } from "@/components/admin/resend-email-button";
import { resolveEffectiveCourier } from "@/lib/tracking-constants";

export const metadata = {
  title: "Terima Kasih Atas Pesanan Anda",
};

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNo: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { orderNo } = await params;
  const sp = searchParams ? await searchParams : {};
  const isRedirectFromMidtrans = Boolean(sp.order_id || sp.transaction_status || sp.status_code);
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
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            order.status === "CANCELLED"
              ? "bg-amber-100 text-amber-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {order.status === "CANCELLED" ? (
            <AlertTriangle className="h-10 w-10" />
          ) : (
            <CheckCircle2 className="h-10 w-10" />
          )}
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-espresso-900 md:text-4xl">
          {order.status === "CANCELLED" ? "Pesanan Kedaluwarsa" : "Terima Kasih!"}
        </h1>
        <p className="mt-2 text-espresso-600">
          {order.status === "CANCELLED"
            ? "Batas waktu pembayaran untuk pesanan ini telah habis atau dibatalkan."
            : "Pesanan Anda telah berhasil dibuat."}
        </p>
        <p className="mt-1 text-sm font-semibold text-espresso-900">
          Nomor Pesanan: <span className="text-caramel-600">{order.orderNo}</span>
        </p>
        {order.status !== "CANCELLED" && (
          <div className="mt-3 flex items-center justify-center">
            <ResendEmailButton orderId={order.id} customerEmail={order.customerEmail} />
          </div>
        )}
      </div>

      {/* Kartu Status Jika Pesanan Dibatalkan / Kedaluwarsa */}
      {order.status === "CANCELLED" && (
        <div className="mt-8 rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-6 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                Pembayaran Kedaluwarsa
              </span>
              <h2 className="mt-1 text-lg font-bold text-amber-950">
                Waktu Pembayaran Telah Berakhir
              </h2>
              <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                Batas waktu pembayaran untuk transaksi ini telah habis. Stok barang telah otomatis dikembalikan ke sistem. Jika Anda masih berminat untuk membeli produk ini, silakan buat pesanan baru.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <LinkButton href="/shop" variant="secondary" size="sm">
                  Belanja Kembali
                </LinkButton>
                <LinkButton href="/" variant="outline" size="sm">
                  Ke Halaman Utama
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Kartu Pembayaran Midtrans jika memilih Midtrans */}
      {isMidtransPayment(order.paymentMethod) && order.status === "PENDING" && (
        <div className="mt-8 rounded-2xl border-2 border-caramel-300 bg-gradient-to-br from-caramel-50/90 via-white to-cream p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-caramel-200/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-caramel-600 text-white shadow-xs">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Menunggu Pembayaran
                </span>
                <h2 className="mt-0.5 text-lg font-bold text-espresso-900">
                  {PAYMENT_LABEL[order.paymentMethod] || "Pembayaran Online Midtrans"}
                </h2>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] font-semibold text-espresso-400 uppercase tracking-wider block">
                Total Tagihan
              </span>
              <p className="font-display text-xl font-bold text-espresso-900">
                {formatCurrency(order.total, settings.currency)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-espresso-600 leading-relaxed max-w-md">
              Selesaikan pembayaran Anda menggunakan {PAYMENT_LABEL[order.paymentMethod] || "metode pembayaran yang dipilih"}. Sistem akan memverifikasi transaksi Anda secara instan dan otomatis tanpa perlu konfirmasi manual.
            </p>
            <MidtransPayButton
              orderNo={order.orderNo}
              buttonLabel="Bayar Sekarang"
              autoOpen={!isRedirectFromMidtrans}
              variant="secondary"
              className="px-6 py-3 text-sm font-bold shadow-md"
            />
          </div>

          <p className="mt-3 text-[11px] text-espresso-400 border-t border-latte/60 pt-3">
            *Pop-up pembayaran Midtrans akan terbuka secara otomatis. Jika pop-up tertutup atau Anda ingin membayar nanti, Anda cukup menekan tombol <strong>Bayar Sekarang</strong> di atas kapan saja.
          </p>
        </div>
      )}

      {isMidtransPayment(order.paymentMethod) && order.status === "PAID" && (
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-emerald-950">
                Pembayaran Midtrans Berhasil Dikonfirmasi
              </h2>
              <p className="text-xs text-emerald-700 mt-0.5">
                Terima kasih, pembayaran pesanan Anda telah kami terima secara otomatis. Kami akan segera memproses pengiriman pesanan Anda.
              </p>
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
            <a
              href={`https://wa.me/${getStoreWhatsApp(settings)}?text=Halo%20Admin%20Wazzopi,%20saya%20sudah%20transfer%20untuk%20pesanan%20${order.orderNo}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-caramel-600 underline"
            >
              (+{getStoreWhatsApp(settings)})
            </a>
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
          {order.trackingNumber && (() => {
            const effective = resolveEffectiveCourier({
              trackingNumber: order.trackingNumber,
              courierCode: order.courierCode,
              courierName: order.courierName,
              shippingMethod: order.shippingMethod,
            });
            return (
              <div className="rounded-xl bg-latte/40 p-3.5 border border-latte space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-espresso-500 block text-xs">Resi Pengiriman</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-caramel-700 text-sm">{order.trackingNumber}</span>
                      <span className="text-xs text-espresso-700 font-semibold">
                        ({effective.courierName})
                      </span>
                    </div>
                  </div>
                  <OrderTrackingModal
                    orderId={order.id}
                    orderNo={order.orderNo}
                    courierCode={order.courierCode}
                    courierName={effective.courierName}
                    trackingNumber={order.trackingNumber}
                    status={order.status}
                    trackingStatus={order.trackingStatus}
                    shippingMethod={order.shippingMethod}
                    history={(() => {
                      try {
                        return order.trackingHistory ? JSON.parse(order.trackingHistory) : [];
                      } catch {
                        return [];
                      }
                    })()}
                    isCustomerView={true}
                  />
                </div>
                {effective.isCourierSwitched && (
                  <div className="rounded-lg bg-amber-50/80 border border-amber-200/80 px-3 py-2 text-xs text-amber-900 leading-relaxed">
                    <p className="font-medium text-amber-950">Catatan Pengiriman:</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {effective.customerNotice || `Paket Anda dikirim menggunakan ${effective.courierName} untuk rute pengantaran yang lebih optimal tanpa biaya tambahan.`}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
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
