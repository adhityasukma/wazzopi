import { CurrencyProvider } from "@/components/currency-provider";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/currency";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [settings, session, categories] = await Promise.all([
    getSettings(),
    getSession(),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
  ]);
  const isFreeActive = settings.shipping.freeShippingEnabled && settings.shipping.freeShippingMin > 0;
  return (
    <CurrencyProvider value={settings.currency}>
      <SiteHeader
        user={session ? { name: session.name, role: session.role } : null}
        categories={categories}
        announcement={
          isFreeActive
            ? `Gratis ongkir untuk belanja minimal ${formatCurrency(settings.shipping.freeShippingMin, settings.currency)}`
            : settings.general.tagline
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} categories={categories} />
    </CurrencyProvider>
  );
}
