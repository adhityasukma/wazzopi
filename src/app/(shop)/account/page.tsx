import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { MemberAreaView } from "@/components/shop/member-area-view";

export const metadata = {
  title: "Member Area - Dashboard & Pesanan",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialTab = resolvedSearchParams.tab || "dashboard";

  const [user, orders, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
    }),
    prisma.order.findMany({
      where: { userId: session.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                image: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getSettings(),
  ]);

  if (!user) redirect("/login");

  return (
    <MemberAreaView
      user={user}
      orders={orders as any}
      settings={settings}
      initialTab={initialTab}
    />
  );
}
