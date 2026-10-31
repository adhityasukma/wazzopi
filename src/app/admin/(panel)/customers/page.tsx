import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";
import { getServerLocale } from "@/i18n/server";
import { CustomersTable } from "@/components/admin/customers-table";

export const metadata = {
  title: "Kelola Customers",
};

export default async function AdminCustomersPage({
  searchParams,
}: PageProps<"/admin/customers">) {
  await requireAdmin();
  const locale = await getServerLocale();
  const isEn = locale === "en";
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const rawLimit = typeof sp.limit === "string" ? sp.limit : "20";
  const currentLimit = ["20", "50", "100", "all"].includes(rawLimit) ? rawLimit : "20";
  const rawPage = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;

  const where = {
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
  };

  const [settings, totalAllCustomers, totalMatching] = await Promise.all([
    getSettings(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where }),
  ]);

  const pageSize = currentLimit === "all" ? null : parseInt(currentLimit, 10);
  const totalPages = pageSize ? Math.max(1, Math.ceil(totalMatching / pageSize)) : 1;
  const currentPage = Math.min(Math.max(1, isNaN(rawPage) ? 1 : rawPage), totalPages);
  const skip = pageSize ? (currentPage - 1) * pageSize : undefined;
  const take = pageSize || undefined;

  const customers = await prisma.user.findMany({
    where,
    include: {
      orders: {
        select: { total: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  // Helper untuk URL reset pencarian (mengosongkan q, namun tetap menjaga limit jika dipilih)
  function getResetSearchHref() {
    const params = new URLSearchParams();
    if (currentLimit !== "20") params.set("limit", currentLimit);
    const qs = params.toString();
    return `/admin/customers${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">
          {isEn ? "Customer List" : "Daftar Pelanggan (Customers)"}
        </h1>
        <p className="mt-1 text-sm text-espresso-500">
          {isEn ? `Total ${totalAllCustomers} customer(s) registered in Wazzopi` : `Total ${totalAllCustomers} customer terdaftar di Wazzopi`}
        </p>
      </div>

      {/* Pencarian */}
      <div className="rounded-xl border border-latte bg-white p-4 shadow-xs">
        <form
          data-loading-message="Mencari data pelanggan..."
          className="flex items-center gap-2 max-w-md"
        >
          {currentLimit !== "20" && <input type="hidden" name="limit" value={currentLimit} />}

          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-espresso-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder={isEn ? "Search name, email, or phone..." : "Cari nama, email, atau no. telepon..."}
              className="w-full rounded-lg border border-espresso-100 bg-white py-2 pl-9 pr-3 text-sm text-espresso-900 placeholder:text-espresso-300 focus:outline-none focus:ring-2 focus:ring-caramel-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-espresso-700 px-4 py-2 text-xs font-semibold text-cream hover:bg-espresso-800"
          >
            {isEn ? "Search" : "Cari"}
          </button>
          {q && (
            <Link
              href={getResetSearchHref()}
              data-loading-message="Mereset kata kunci pencarian..."
              className="rounded-lg border border-espresso-200 px-3 py-2 text-xs font-semibold text-espresso-600 hover:bg-espresso-50 transition"
              title="Kosongkan pencarian"
            >
              {isEn ? "Reset" : "Reset"}
            </Link>
          )}
        </form>
      </div>

      {/* Komponen Tabel dengan Multi-Select, Bulk Delete, Show Data & Pagination */}
      <CustomersTable
        customers={customers}
        currency={settings.currency}
        totalMatching={totalMatching}
        totalAllCustomers={totalAllCustomers}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        currentLimit={currentLimit}
        searchQuery={q}
      />
    </div>
  );
}
