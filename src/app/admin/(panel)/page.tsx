import Link from "next/link";
import {
  ArrowUpRight,
  Coffee,
  DollarSign,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, SALES_STATUSES } from "@/lib/utils";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Dashboard Admin",
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [settings, totalProducts, totalCustomers, orders] = await Promise.all([
    getSettings(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 200,
    }),
  ]);

  // Statistik pendapatan dan pesanan
  const validOrders = orders.filter((o) => SALES_STATUSES.includes(o.status));
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;

  // Persiapan data grafik 30 hari terakhir
  const now = new Date();
  const past30Days: Record<string, { date: string; revenue: number; orders: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = d.toISOString().slice(0, 10);
    past30Days[key] = {
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      revenue: 0,
      orders: 0,
    };
  }

  orders.forEach((o) => {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (past30Days[key]) {
      past30Days[key].orders += 1;
      if (SALES_STATUSES.includes(o.status)) {
        past30Days[key].revenue += o.total;
      }
    }
  });

  const chartData = Object.values(past30Days);

  // Status breakdown
  const statusCounts: Record<string, number> = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const recentOrders = orders.slice(0, 7);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">Dashboard Ringkasan</h1>
        <p className="mt-1 text-sm text-espresso-500">
          Statistik performa penjualan dan aktivitas toko online Wazzopi.
        </p>
      </div>

      {/* 4 Kartu KPI Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-latte bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-espresso-400">Total Pendapatan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-espresso-900">
            {formatCurrency(totalRevenue, settings.currency)}
          </p>
          <p className="mt-1 text-[11px] text-espresso-400">Dari pesanan terbayar & selesai</p>
        </div>

        <div className="rounded-xl border border-latte bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-espresso-400">Total Pesanan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-espresso-900">{totalOrdersCount}</p>
          <p className="mt-1 text-[11px] text-espresso-400">Keseluruhan transaksi masuk</p>
        </div>

        <div className="rounded-xl border border-latte bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-espresso-400">Total Pelanggan</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-espresso-900">{totalCustomers}</p>
          <p className="mt-1 text-[11px] text-espresso-400">Akun pembeli terdaftar</p>
        </div>

        <div className="rounded-xl border border-latte bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-espresso-400">Katalog Produk</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-caramel-50 text-caramel-700">
              <Coffee className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 font-display text-2xl font-bold text-espresso-900">{totalProducts}</p>
          <p className="mt-1 text-[11px] text-espresso-400">Item produk aktif di toko</p>
        </div>
      </div>

      {/* Bagian Grafik Visual */}
      <DashboardCharts chartData={chartData} statusCounts={statusCounts} />

      {/* Tabel Pesanan Terbaru */}
      <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-latte pb-4">
          <div>
            <h2 className="text-lg font-bold text-espresso-900">Pesanan Terbaru</h2>
            <p className="text-xs text-espresso-400">Daftar transaksi yang baru saja masuk</p>
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs font-semibold text-caramel-600 hover:underline"
          >
            Lihat Semua Pesanan <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-espresso-50/60 text-xs uppercase text-espresso-500">
              <tr>
                <th className="px-4 py-3">No. Pesanan</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte">
              {recentOrders.map((o) => (
                <tr key={o.id} className="hover:bg-cream/40">
                  <td className="px-4 py-3 font-mono font-semibold text-espresso-900">{o.orderNo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-espresso-900">{o.customerName}</p>
                    <p className="text-xs text-espresso-400">{o.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-espresso-500">{formatDate(o.createdAt, true)}</td>
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
                      className="rounded-md border border-latte bg-white px-2.5 py-1 text-xs font-semibold text-espresso-700 hover:bg-latte"
                    >
                      Detail
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
