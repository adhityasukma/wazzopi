import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  href = "/",
  light = false,
  className,
  showWordmark = true,
  size = "md",
}: {
  href?: string;
  light?: boolean;
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const h = { sm: 30, md: 38, lg: 52 }[size];
  const mark = light ? "/logo-mark-light.png" : "/logo-mark.png";
  const word = light ? "/logo-wordmark-light.png" : "/logo-wordmark.png";
  return (
    <Link
      href={href}
      data-loading-message={href === "/admin" ? "Membuka Dashboard Admin..." : "Membuka Beranda..."}
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="Wazzopi"
    >
      <Image src={mark} alt="" width={Math.round((h * 430) / 380)} height={h} priority />
      {showWordmark && (
        <Image
          src={word}
          alt="Wazzopi"
          width={Math.round((h * 0.62 * 805) / 190)}
          height={Math.round(h * 0.62)}
          priority
        />
      )}
    </Link>
  );
}
