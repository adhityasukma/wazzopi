import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";
import { ReportsView } from "@/components/admin/reports-view";

export const metadata = {
  title: "Laporan Penjualan",
};

export default async function AdminReportsPage() {
  await requireAdmin();

  const [settings, orders] = await Promise.all([
    getSettings(),
    prisma.order.findMany({
      select: {
        id: true,
        orderNo: true,
        customerName: true,
        subtotal: true,
        shippingCost: true,
        total: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">Laporan Penjualan</h1>
        <p className="mt-1 text-sm text-espresso-500">
          Analisis performa omzet harian, bulanan, dan tahunan dengan fitur perbandingan 2 rentang tanggal.
        </p>
      </div>

      <ReportsView orders={orders} currency={settings.currency} />
    </div>
  );
}
