import Link from "next/link";
import { Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth";
import { OrdersTable } from "@/components/admin/orders-table";

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

  const rawLimit = typeof sp.limit === "string" ? sp.limit : "20";
  const currentLimit = ["20", "50", "100", "all"].includes(rawLimit) ? rawLimit : "20";
  const rawPage = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;

  const where = {
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
  };

  const [settings, totalAllOrders, totalMatching] = await Promise.all([
    getSettings(),
    prisma.order.count(),
    prisma.order.count({ where }),
  ]);

  const pageSize = currentLimit === "all" ? null : parseInt(currentLimit, 10);
  const totalPages = pageSize ? Math.max(1, Math.ceil(totalMatching / pageSize)) : 1;
  const currentPage = Math.min(Math.max(1, isNaN(rawPage) ? 1 : rawPage), totalPages);
  const skip = pageSize ? (currentPage - 1) * pageSize : undefined;
  const take = pageSize || undefined;

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        select: { id: true, productName: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });

  // Helper untuk reset pencarian q (mengosongkan kata kunci pencarian, tetap menjaga status & limit jika ada)
  function getResetSearchHref() {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (currentLimit !== "20") params.set("limit", currentLimit);
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  }

  // Helper untuk URL filter status yang mempertahankan query parameter limit & q
  function getStatusFilterHref(st?: string) {
    const params = new URLSearchParams();
    if (st) params.set("status", st);
    if (q) params.set("q", q);
    if (currentLimit !== "20") params.set("limit", currentLimit);
    const qs = params.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">
            Kelola Pesanan (Orders)
          </h1>
          <p className="mt-1 text-sm text-espresso-500">
            Total {totalAllOrders} transaksi pesanan di sistem toko
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="rounded-xl border border-latte bg-white p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <form
          data-loading-message="Mencari pesanan..."
          className="flex flex-1 items-center gap-2 max-w-md"
        >
          {status && <input type="hidden" name="status" value={status} />}
          {currentLimit !== "20" && <input type="hidden" name="limit" value={currentLimit} />}

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
          {q && (
            <Link
              href={getResetSearchHref()}
              data-loading-message="Mereset kata kunci pencarian..."
              className="rounded-lg border border-espresso-200 px-3 py-2 text-xs font-semibold text-espresso-600 hover:bg-espresso-50 transition"
              title="Kosongkan pencarian"
            >
              Reset
            </Link>
          )}
        </form>

        <div className="flex flex-wrap gap-1.5">
          <Link
            href={getStatusFilterHref()}
            data-loading-message="Memuat semua pesanan..."
            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
              !status ? "bg-espresso-700 text-cream" : "bg-latte text-espresso-800"
            }`}
          >
            Semua
          </Link>
          {ORDER_STATUSES.map((st) => (
            <Link
              key={st}
              href={getStatusFilterHref(st)}
              data-loading-message={`Menyaring pesanan (${ORDER_STATUS_LABEL[st]})...`}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                status === st ? "bg-espresso-700 text-cream" : "bg-latte text-espresso-800"
              }`}
            >
              {ORDER_STATUS_LABEL[st]}
            </Link>
          ))}

          {(q || status) && (
            <Link
              href={currentLimit !== "20" ? `/admin/orders?limit=${currentLimit}` : "/admin/orders"}
              data-loading-message="Mereset semua filter..."
              className="rounded-lg border border-dashed border-espresso-300 px-2.5 py-1 text-xs font-medium text-espresso-500 hover:bg-espresso-50 hover:text-espresso-800 transition"
              title="Kembali ke tampilan awal semua pesanan"
            >
              Reset Semua Filter
            </Link>
          )}
        </div>
      </div>

      {/* Komponen Tabel Pesanan dengan Multi-Select, Bulk Delete, Show Data & Pagination */}
      <OrdersTable
        orders={orders}
        currency={settings.currency}
        totalMatching={totalMatching}
        totalAllOrders={totalAllOrders}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        currentLimit={currentLimit}
        currentStatus={status}
        searchQuery={q}
      />
    </div>
  );
}
