import Link from "next/link";
import { Search, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";
import { formatDate, ORDER_STATUSES, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, PAYMENT_LABEL } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Kelola Pesanan",
};

export default async function AdminOrdersPage({
  searchParams,
}: PageProps<"/admin/orders">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const status = typeof sp.status === "string" ? sp.status : undefined;

  const [settings, orders] = await Promise.all([
    getSettings(),
    prisma.order.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { orderNo: { contains: q } },
                { customerName: { contains: q } },
                { customerPhone: { contains: q } },
              ],
            }
          : {}),
        ...(status ? { status } : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">Kelola Pesanan (Orders)</h1>
          <p className="mt-1 text-sm text-espresso-500">
            Total {orders.length} transaksi pesanan masuk
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="rounded-xl border border-latte bg-white p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <form className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-espresso-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari No. Order atau Nama Pelanggan..."
              className="w-full rounded-lg border border-espresso-100 bg-white py-2 pl-9 pr-3 text-sm text-espresso-900 placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-caramel-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-espresso-700 px-4 py-2 text-xs font-semibold text-cream hover:bg-espresso-800"
          >
            Cari
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/admin/orders"
            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
              !status ? "bg-espresso-700 text-cream" : "bg-latte text-espresso-800"
            }`}
          >
            Semua
          </Link>
          {ORDER_STATUSES.map((st) => (
            <Link
              key={st}
              href={`/admin/orders?status=${st}`}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                status === st ? "bg-espresso-700 text-cream" : "bg-latte text-espresso-800"
              }`}
            >
              {ORDER_STATUS_LABEL[st]}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabel Pesanan */}
      <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-espresso-50/70 text-xs uppercase text-espresso-500">
              <tr>
                <th className="px-4 py-3">No. Pesanan</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Pengiriman & Bayar</th>
                <th className="px-4 py-3">Item Produk</th>
                <th className="px-4 py-3">Total Tagihan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-cream/30">
                  <td className="px-4 py-3 font-mono font-bold text-espresso-900">
                    {o.orderNo}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-espresso-900">{o.customerName}</p>
                    <p className="text-xs text-espresso-400">{o.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-espresso-500">
                    {formatDate(o.createdAt, true)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-medium text-espresso-800">{o.shippingMethod}</p>
                    <p className="text-espresso-400">{PAYMENT_LABEL[o.paymentMethod] || o.paymentMethod}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-espresso-600">
                    {o.items.length} item ({o.items.map((i) => i.productName).slice(0, 2).join(", ")}
                    {o.items.length > 2 ? "..." : ""})
                  </td>
                  <td className="px-4 py-3 font-semibold text-espresso-900">
                    {formatCurrency(o.total, settings.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        ORDER_STATUS_STYLE[o.status] || "bg-latte text-espresso-800"
                      }`}
                    >
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="rounded-lg border border-espresso-200 bg-white px-3 py-1.5 text-xs font-semibold text-espresso-700 hover:bg-latte shadow-xs"
                    >
                      Kelola
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
