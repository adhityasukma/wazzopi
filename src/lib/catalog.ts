import "server-only";
import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import type { ProductCardData } from "@/components/shop/product-card";

export const productCardInclude = {
  category: { select: { name: true } },
  variants: { select: { price: true, stock: true } },
} satisfies Prisma.ProductInclude;

type ProductWithCard = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

export function toCard(p: ProductWithCard): ProductCardData {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.image,
    price: p.price,
    comparePrice: p.comparePrice,
    stock: p.hasVariants ? p.variants.reduce((a, v) => a + v.stock, 0) : p.stock,
    hasVariants: p.hasVariants,
    category: p.category?.name ?? null,
    maxPrice: p.hasVariants && p.variants.length ? Math.max(...p.variants.map((v) => v.price)) : p.price,
  };
}

export async function getProductCards(args: Prisma.ProductFindManyArgs = {}) {
  const rows = await prisma.product.findMany({
    ...args,
    where: { status: "PUBLISHED", ...(args.where ?? {}) },
    include: productCardInclude,
  });
  return (rows as ProductWithCard[]).map(toCard);
}
