import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { LoadingProvider } from "@/components/loading-provider";
import { getServerLocale } from "@/i18n/server";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Wazzopi — Satu Teguk, Banyak Cerita",
    template: "%s | Wazzopi",
  },
  description:
    "Wazzopi menghadirkan kopi pilihan dari berbagai penjuru Nusantara. Satu Teguk, Banyak Cerita.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <LoadingProvider initialLocale={locale}>{children}</LoadingProvider>
      </body>
    </html>
  );
}
