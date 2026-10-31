"use client";

import { MessageCircle } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function FloatingWhatsApp({
  waPhone,
  storeName = "Wazzopi",
}: {
  waPhone: string;
  storeName?: string;
}) {
  const { locale } = useI18n();
  const isEn = locale === "en";

  if (!waPhone) return null;

  const cleanNumber = waPhone.replace(/[^0-9]/g, "");
  const textMessage = encodeURIComponent(
    isEn
      ? `Hello ${storeName} Team, I would like to inquire about your products and orders.`
      : `Halo Admin ${storeName}, saya ingin bertanya seputar produk dan pesanan.`
  );
  const waUrl = `https://wa.me/${cleanNumber}?text=${textMessage}`;

  return (
    <aside aria-label={isEn ? "WhatsApp Support" : "Bantuan WhatsApp"} className="fixed bottom-6 right-6 z-40 flex items-center group">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg hover:bg-[#20ba59] hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label={isEn ? "Chat on WhatsApp" : "Chat dengan WA"}
      >
        <MessageCircle className="h-5 w-5 fill-current" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline-block">
          {isEn ? "Chat on WhatsApp" : "Chat dengan WA"}
        </span>
      </a>
    </aside>
  );
}
