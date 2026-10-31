import { redirect } from "next/navigation";
import { CurrencyProvider } from "@/components/currency-provider";
import { I18nProvider } from "@/i18n/provider";
import { getServerDictionary, getServerLocale } from "@/i18n/server";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: LayoutProps<"/admin">) {
  const [session, settings, locale, dictionary] = await Promise.all([
    requireStaff(),
    getSettings(),
    getServerLocale(),
    getServerDictionary(),
  ]);

  return (
    <CurrencyProvider value={settings.currency}>
      <I18nProvider locale={locale} dictionary={dictionary}>
        <div className="flex min-h-screen bg-cream">
          {/* Sidebar Navigasi Admin */}
          <AdminSidebar role={session.role} />

          <div className="flex flex-1 flex-col lg:pl-64">
            {/* Header Topbar */}
            <AdminHeader user={session} />

            {/* Konten Utama */}
            <main className="flex-1 p-6 md:p-8">{children}</main>
          </div>
        </div>
      </I18nProvider>
    </CurrencyProvider>
  );
}
