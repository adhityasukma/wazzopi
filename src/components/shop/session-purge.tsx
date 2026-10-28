"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Komponen ini otomatis menghapus cookie session dari browser
 * ketika database mendeteksi data user sudah tidak ada (dihapus oleh admin)
 */
export function SessionPurge() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/logout", { method: "POST" })
      .then(() => {
        router.refresh();
      })
      .catch((err) => {
        console.error("[SessionPurge Error]:", err);
      });
  }, [router]);

  return null;
}
