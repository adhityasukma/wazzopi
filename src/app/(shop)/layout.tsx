import { cookies } from "next/headers";
import { CurrencyProvider } from "@/components/currency-provider";
import { SiteHeader } from "@/components/shop/site-header";
import { SiteFooter } from "@/components/shop/site-footer";
import { FloatingWhatsApp } from "@/components/shop/floating-whatsapp";
import { SessionPurge } from "@/components/shop/session-purge";
import { getSession } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/jwt";
import { formatCurrency } from "@/lib/currency";
import { getSettings } from "@/lib/settings";
import { getStoreWhatsApp } from "@/lib/settings-types";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const hasSessionCookie = Boolean(cookieStore.get(SESSION_COOKIE)?.value);

  const [settings, session, categories] = await Promise.all([
    getSettings(),
    getSession(),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
  ]);

  const isFreeActive = settings.shipping.freeShippingEnabled && settings.shipping.freeShippingMin > 0;
  const isStaleSession = hasSessionCookie && !session;
  const waPhone = getStoreWhatsApp(settings);

  return (
    <CurrencyProvider value={settings.currency}>
      {isStaleSession && <SessionPurge />}
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
      <FloatingWhatsApp waPhone={waPhone} storeName={settings.general.storeName} />
      <SiteFooter settings={settings} categories={categories} />
    </CurrencyProvider>
  );
}
