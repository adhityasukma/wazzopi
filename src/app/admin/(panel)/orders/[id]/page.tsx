import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Printer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";
import { formatDate, ORDER_STATUSES, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, PAYMENT_LABEL } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/actions/orders";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderTrackingForm } from "@/components/admin/order-tracking-form";
import { ResendEmailButton } from "@/components/admin/resend-email-button";

export const metadata = {
  title: "Rincian Pesanan",
};

export default async function AdminOrderDetailPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;

  const [settings, order] = await Promise.all([
    getSettings(),
    prisma.order.findUnique({
      where: { id },
      include: { items: true, user: true },
    }),
  ]);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-espresso-500 hover:text-espresso-800 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Pesanan
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">
              Pesanan #{order.orderNo}
            </h1>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                ORDER_STATUS_STYLE[order.status] || "bg-latte text-espresso-800"
              }`}
            >
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-espresso-400">
            Dibuat pada {formatDate(order.createdAt, true)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ResendEmailButton orderId={order.id} customerEmail={order.customerEmail} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Rincian Produk & Pengiriman */}
        <div className="space-y-6 lg:col-span-8">
          {/* Item Produk */}
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-4">
              Daftar Produk Pesanan
            </h2>
            <div className="divide-y divide-latte">
              {order.items.map((it) => (
                <div key={it.id} className="flex justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold text-espresso-900">{it.productName}</p>
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

            <div className="mt-4 space-y-2 border-t border-latte pt-4 text-sm">
              <div className="flex justify-between text-espresso-600">
                <span>Subtotal Produk</span>
                <span className="font-medium text-espresso-900">
                  {formatCurrency(order.subtotal, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between text-espresso-600">
                <span>Ongkos Kirim ({order.shippingMethod})</span>
                <span className="font-medium text-espresso-900">
                  {order.shippingCost === 0 ? "Gratis" : formatCurrency(order.shippingCost, settings.currency)}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-latte pt-3 font-bold text-espresso-900">
                <span>Total Tagihan</span>
                <span className="font-display text-2xl text-espresso-900">
                  {formatCurrency(order.total, settings.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Data Pengiriman & Catatan */}
          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Alamat Pengiriman & Catatan
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-espresso-400">Penerima</p>
                <p className="font-semibold text-espresso-900">{order.customerName}</p>
                <p className="text-xs text-espresso-600">{order.customerPhone}</p>
                <p className="text-xs text-espresso-600">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs text-espresso-400">Alamat Lengkap</p>
                <p className="text-espresso-800">
                  {order.address}, {order.city}, {order.province} {order.postalCode}
                </p>
              </div>
              {order.notes && (
                <div className="sm:col-span-2 rounded-lg bg-latte/40 p-3 text-xs text-espresso-700">
                  <strong>Catatan Pesanan:</strong> {order.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Ubah Status & Pembayaran */}
        <div className="space-y-6 lg:col-span-4">
          {/* Form Ubah Status Interaktif */}
          <OrderStatusForm orderId={order.id} currentStatus={order.status} />

          {/* Form Input Resi & Tracking Otomatis */}
          <OrderTrackingForm
            orderId={order.id}
            orderNo={order.orderNo}
            currentCourierCode={order.courierCode}
            currentCourierName={order.courierName}
            currentTrackingNumber={order.trackingNumber}
            currentTrackingStatus={order.trackingStatus}
            trackingHistory={order.trackingHistory}
            orderStatus={order.status}
          />

          <div className="rounded-xl border border-latte bg-white p-6 shadow-xs text-sm space-y-3">
            <h2 className="text-base font-bold text-espresso-900 border-b border-latte pb-3">
              Informasi Pembayaran
            </h2>
            <div className="flex justify-between">
              <span className="text-espresso-500">Metode</span>
              <span className="font-semibold text-espresso-900">
                {PAYMENT_LABEL[order.paymentMethod] || order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-espresso-500">Akun Member</span>
              <span className="font-medium text-espresso-800">
                {order.user ? order.user.name : "Tamu (Guest Checkout)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
