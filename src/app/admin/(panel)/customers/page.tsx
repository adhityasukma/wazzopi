import { Search, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";

export const metadata = {
  title: "Kelola Customers",
};

export default async function AdminCustomersPage({
  searchParams,
}: PageProps<"/admin/customers">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [settings, customers] = await Promise.all([
    getSettings(),
    prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
                { phone: { contains: q } },
              ],
            }
          : {}),
      },
      include: {
        orders: {
          select: { total: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">Daftar Pelanggan (Customers)</h1>
        <p className="mt-1 text-sm text-espresso-500">
          Total {customers.length} customer terdaftar di Wazzopi
        </p>
      </div>

      {/* Pencarian */}
      <div className="rounded-xl border border-latte bg-white p-4 shadow-xs">
        <form className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-espresso-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama, email, atau no. telepon..."
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
      </div>

      {/* Tabel Customers */}
      <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-espresso-50/70 text-xs uppercase text-espresso-500">
              <tr>
                <th className="px-4 py-3">Nama Pelanggan</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Kota & Alamat</th>
                <th className="px-4 py-3">Total Pesanan</th>
                <th className="px-4 py-3">Total Belanja (LTV)</th>
                <th className="px-4 py-3">Terdaftar Sejak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte">
              {customers.map((c) => {
                const totalSpent = c.orders.reduce((sum, o) => sum + o.total, 0);

                return (
                  <tr key={c.id} className="hover:bg-cream/30">
                    <td className="px-4 py-3 font-semibold text-espresso-900">{c.name}</td>
                    <td className="px-4 py-3 text-xs">
                      <p className="text-espresso-800">{c.email}</p>
                      <p className="text-espresso-400">{c.phone || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-espresso-600">
                      {c.city ? `${c.city}, ${c.province}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-latte px-2.5 py-0.5 text-xs font-semibold text-espresso-800">
                        {c.orders.length} pesanan
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-espresso-900">
                      {formatCurrency(totalSpent, settings.currency)}
                    </td>
                    <td className="px-4 py-3 text-xs text-espresso-400">
                      {formatDate(c.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
