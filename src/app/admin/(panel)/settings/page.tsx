import { getSettings } from "@/lib/settings";
import { requireAdmin } from "@/lib/auth";
import { getServerLocale } from "@/i18n/server";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata = {
  title: "Pengaturan Toko",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const locale = await getServerLocale();
  const isEn = locale === "en";
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-espresso-900 md:text-3xl">{isEn ? "Store Settings" : "Pengaturan Toko"}</h1>
        <p className="mt-1 text-sm text-espresso-500">
          {isEn ? "Configure store identity, currency format, payment methods, and shipping couriers." : "Konfigurasi identitas toko, opsi format mata uang (currency), pembayaran, dan kurir pengiriman."}
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
