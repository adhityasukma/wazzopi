import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getServerLocale } from "@/i18n/server";
import { ProductForm } from "@/components/admin/product-form";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return {
    title: locale === "en" ? "Edit Product" : "Edit Produk",
  };
}

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const [session, locale] = await Promise.all([
    requireAdmin(),
    getServerLocale(),
  ]);
  const isEn = locale === "en";
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">
          {isEn ? "Edit Product" : "Edit Produk"}
        </h1>
        <p className="mt-1 text-sm text-espresso-500">
          {isEn ? `Update product details for ${product.name}` : `Perbarui rincian produk ${product.name}`}
        </p>
      </div>

      <ProductForm product={product} categories={categories} />
    </div>
  );
}
