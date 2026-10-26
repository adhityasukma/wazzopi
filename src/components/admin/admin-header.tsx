"use client";

import Link from "next/link";
import { ExternalLink, ShieldCheck, User } from "lucide-react";

export function AdminHeader({
  user,
}: {
  user: { name: string; role: string; email: string };
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-latte bg-cream/90 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-lg border border-espresso-200 bg-white px-3 py-1.5 text-xs font-medium text-espresso-700 shadow-xs hover:bg-latte transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Lihat Toko Depan
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso-700 text-xs font-bold text-cream">
            {user.name.charAt(0)}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-espresso-900">{user.name}</p>
            <span className="inline-block rounded bg-caramel-100 px-1.5 py-0.2 text-[10px] font-semibold text-caramel-800 uppercase">
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
