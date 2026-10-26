import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";
import { CustomersTable } from "@/components/admin/customers-table";

export const metadata = {
  title: "Kelola Customers",
};

export default async function AdminCustomersPage({
  searchParams,
}: PageProps<"/admin/customers">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [settings, customers, totalAllCustomers] = await Promise.all([
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
    prisma.user.count({
      where: { role: "CUSTOMER" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">
          Daftar Pelanggan (Customers)
        </h1>
        <p className="mt-1 text-sm text-espresso-500">
          Total {totalAllCustomers} customer terdaftar di Wazzopi
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
          {q && (
            <a
              href="/admin/customers"
              className="rounded-lg border border-espresso-200 px-3 py-2 text-xs font-semibold text-espresso-600 hover:bg-espresso-50"
            >
              Reset
            </a>
          )}
        </form>
      </div>

      {/* Komponen Tabel dengan Multi-Select, Bulk Delete & Delete ALL */}
      <CustomersTable
        customers={customers}
        currency={settings.currency}
        totalAllCustomers={totalAllCustomers}
        searchQuery={q}
      />
    </div>
  );
}
