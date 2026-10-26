import { redirect } from "next/navigation";
import { ExternalLink, LogOut, Package, Settings, User } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { AccountProfileForm } from "@/components/shop/account-profile-form";
import { AccountPasswordForm } from "@/components/shop/account-password-form";
import { MidtransPayButton } from "@/components/shop/midtrans-pay-button";

export const metadata = {
  title: "Member Area",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [user, orders, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
    }),
    prisma.order.findMany({
      where: { userId: session.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    getSettings(),
  ]);

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-col justify-between gap-4 border-b border-latte pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold text-espresso-900 md:text-4xl">Member Area</h1>
          <p className="mt-1 text-sm text-espresso-400">
            Selamat datang kembali, <strong className="text-espresso-800">{user.name}</strong> ({user.email})
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
          >
            <LogOut className="h-4 w-4" /> Keluar
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Kolom Kiri: Riwayat Pesanan */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-espresso-900">
              <Package className="h-5 w-5 text-caramel-500" /> Riwayat Pesanan Saya
            </h2>

            {orders.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-espresso-500">Anda belum pernah melakukan pemesanan.</p>
                <Link
                  href="/products"
                  className="mt-3 inline-block font-semibold text-caramel-600 underline"
                >
                  Mulai Belanja Sekarang
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-latte p-4 transition-all hover:border-espresso-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-latte pb-3">
                      <div>
                        <span className="font-mono text-sm font-bold text-espresso-900">
                          {order.orderNo}
                        </span>
                        <p className="text-xs text-espresso-400">
                          {formatDate(order.createdAt, true)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          ORDER_STATUS_STYLE[order.status] || "bg-latte text-espresso-800"
                        }`}
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    </div>

                    <div className="mt-3 divide-y divide-latte/60">
                      {order.items.map((it) => (
                        <div key={it.id} className="flex justify-between py-1.5 text-xs">
                          <span className="text-espresso-800">
                            {it.productName} {it.variantName && `(${it.variantName})`} x {it.quantity}
                          </span>
                          <span className="font-medium text-espresso-900">
                            {formatCurrency(it.total, settings.currency)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-latte pt-3 text-xs">
                      <span className="text-espresso-500">Pengiriman: {order.shippingMethod}</span>
                      <div className="text-right">
                        <span className="text-espresso-500">Total: </span>
                        <span className="font-display font-bold text-sm text-espresso-900">
                          {formatCurrency(order.total, settings.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-latte/60 pt-3">
                      <Link
                        href={`/checkout/success/${order.orderNo}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-espresso-600 hover:text-caramel-600 hover:underline"
                      >
                        Lihat Rincian Pesanan &rarr;
                      </Link>

                      {order.paymentMethod === "midtrans" && order.status === "PENDING" && (
                        <MidtransPayButton
                          orderNo={order.orderNo}
                          buttonLabel="Lanjutkan Pembayaran"
                          variant="secondary"
                          className="py-1.5 px-3 text-xs"
                        />
                      )}

                      {order.paymentMethod === "bank_transfer" && order.status === "PENDING" && (
                        <Link
                          href={`/checkout/success/${order.orderNo}`}
                          className="inline-flex items-center gap-1 rounded-md bg-caramel-50 px-2.5 py-1 text-xs font-semibold text-caramel-700 border border-caramel-200 hover:bg-caramel-100"
                        >
                          Petunjuk Transfer Bank &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Pengaturan Akun */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-espresso-900 mb-4">
              <User className="h-5 w-5 text-caramel-500" /> Profil & Alamat Utama
            </h2>
            <AccountProfileForm user={user} />
          </div>

          <div className="rounded-xl border border-latte bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-semibold text-espresso-900 mb-4">
              <Settings className="h-5 w-5 text-caramel-500" /> Ganti Password
            </h2>
            <AccountPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
