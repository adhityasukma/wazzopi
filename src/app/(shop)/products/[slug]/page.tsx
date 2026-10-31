import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Flame, Leaf, Truck } from "lucide-react";
import { AddToCart } from "@/components/shop/add-to-cart";
import { ProductCard } from "@/components/shop/product-card";
import { getProductCards } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { getServerDictionary, getServerLocale } from "@/i18n/server";

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, variants: { orderBy: { price: "asc" } } },
  });
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  return { title: p?.name ?? "Produk", description: p?.description ?? undefined };
}

export default async function ProductDetailPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const [product, dict, locale] = await Promise.all([
    getProduct(slug),
    getServerDictionary(),
    getServerLocale(),
  ]);
  if (!product) notFound();

  const related = await getProductCards({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <nav className="text-xs text-espresso-400">
        <Link href="/" className="hover:text-caramel-500">
          {dict.common.home}
        </Link>{" "}
        /{" "}
        <Link href="/products" className="hover:text-caramel-500">
          {dict.common.allProducts}
        </Link>
        {product.category && (
          <>
            {" "}
            /{" "}
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-caramel-500">
              {product.category.name}
            </Link>
          </>
        )}{" "}
        / <span className="text-espresso-700">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-latte">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>

        <div className="lg:py-4">
          {product.category && (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-caramel-500">
              {product.category.name}
            </p>
          )}
          <h1 className="mt-2 text-3xl font-semibold text-espresso-900 md:text-4xl">{product.name}</h1>

          <AddToCart
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              image: product.image,
              price: product.price,
              comparePrice: product.comparePrice,
              stock: product.stock,
              hasVariants: product.hasVariants,
              variants: product.variants.map((v) => ({ id: v.id, name: v.name, price: v.price, stock: v.stock })),
            }}
          />

          {product.description && (
            <div className="mt-10 border-t border-latte pt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-espresso-900">
                {dict.products.description}
              </h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-espresso-600">{product.description}</p>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Flame,
                text: locale === "en" ? "Freshly roasted" : "Disangrai segar",
              },
              {
                icon: Leaf,
                text: locale === "en" ? "Selected beans" : "Biji pilihan",
              },
              {
                icon: Truck,
                text: locale === "en" ? "Worldwide shipping" : "Kirim ke seluruh Indonesia",
              },
            ].map((f) => (
              <div
                key={f.text}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-3 text-xs text-espresso-600 ring-1 ring-latte"
              >
                <f.icon className="h-4 w-4 text-caramel-500" /> {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-2xl font-semibold text-espresso-900">
            {locale === "en" ? "Related Products" : "Produk Terkait"}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
