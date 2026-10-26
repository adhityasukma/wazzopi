import Image from "next/image";
import Link from "next/link";
import { Edit2, PackagePlus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/currency";
import { requireStaff } from "@/lib/auth";
import { LinkButton } from "@/components/ui";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const metadata = {
  title: "Kelola Produk",
};

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const session = await requireStaff();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const cat = typeof sp.category === "string" ? sp.category : undefined;

  const [settings, categories, products] = await Promise.all([
    getSettings(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        ...(q ? { name: { contains: q } } : {}),
        ...(cat ? { categoryId: cat } : {}),
      },
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const isAdmin = session.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">Kelola Produk</h1>
          <p className="mt-1 text-sm text-espresso-500">
            Total {products.length} produk terdaftar dalam katalog
          </p>
        </div>
        <LinkButton href="/admin/products/new">
          <PackagePlus className="h-4 w-4" /> Tambah Produk Baru
        </LinkButton>
      </div>

      {/* Filter & Search */}
      <div className="rounded-xl border border-latte bg-white p-4 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <form data-loading-message="Mencari produk..." className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-espresso-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama produk..."
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

        <div className="flex gap-2">
          <Link
            href="/admin/products"
            data-loading-message="Memuat semua produk..."
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
              !cat ? "bg-espresso-700 text-cream" : "bg-latte text-espresso-800"
            }`}
          >
            Semua
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/admin/products?category=${c.id}`}
              data-loading-message={`Menyaring kategori ${c.name}...`}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                cat === c.id ? "bg-espresso-700 text-cream" : "bg-latte text-espresso-800"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Tabel Produk */}
      <div className="overflow-hidden rounded-xl border border-latte bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-espresso-50/70 text-xs uppercase text-espresso-500">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Tipe</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-latte">
              {products.map((p) => {
                const totalStock = p.hasVariants
                  ? p.variants.reduce((acc, v) => acc + v.stock, 0)
                  : p.stock;

                return (
                  <tr key={p.id} className="hover:bg-cream/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-latte">
                          {p.image && (
                            <Image src={p.image} alt={p.name} fill sizes="48px" className="object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-espresso-900">{p.name}</p>
                          <p className="text-xs text-espresso-400">SKU: {p.sku || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-espresso-600">
                      {p.category?.name || "Tanpa Kategori"}
                    </td>
                    <td className="px-4 py-3">
                      {p.hasVariants ? (
                        <span className="inline-flex rounded-full bg-caramel-50 px-2 py-0.5 text-xs font-semibold text-caramel-800">
                          {p.variants.length} Varian
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-latte px-2 py-0.5 text-xs text-espresso-700">
                          Tunggal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-espresso-900">
                      {formatCurrency(p.price, settings.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-medium ${
                          totalStock <= 5 ? "text-rose-600 font-bold" : "text-espresso-800"
                        }`}
                      >
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-espresso-100 text-espresso-600"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isAdmin ? (
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="rounded-lg p-1.5 text-espresso-600 hover:bg-latte"
                            title="Edit Produk"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <DeleteProductButton id={p.id} name={p.name} />
                        </div>
                      ) : (
                        <span className="text-xs text-espresso-400 italic">Lihat Saja</span>
                      )}
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
