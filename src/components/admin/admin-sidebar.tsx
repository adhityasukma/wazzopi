"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Coffee,
  FolderTree,
  Images,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { adminLogout } from "@/actions/auth";
import { useI18n } from "@/i18n/provider";
import { cn } from "@/lib/utils";

type Props = {
  role: "ADMIN" | "KARYAWAN" | "CUSTOMER";
};

export function AdminSidebar({ role }: Props) {
  const pathname = usePathname();
  const { t } = useI18n();

  // Menu untuk Administrator
  const adminNav = [
    { href: "/admin", label: t.admin.sidebarDashboard, icon: LayoutDashboard },
    { href: "/admin/hero-slides", label: t.admin.sidebarHeroSlides, icon: Images },
    { href: "/admin/products", label: t.admin.sidebarProducts, icon: Coffee },
    { href: "/admin/categories", label: t.admin.sidebarCategories, icon: FolderTree },
    { href: "/admin/orders", label: t.admin.sidebarOrders, icon: ShoppingBag },
    { href: "/admin/customers", label: t.admin.sidebarCustomers, icon: Users },
    { href: "/admin/reports", label: t.admin.sidebarReports, icon: BarChart3 },
    { href: "/admin/settings", label: t.admin.sidebarSettings, icon: Settings },
  ];

  // Menu untuk Karyawan (Hanya tambah produk & daftar produk)
  const karyawanNav = [
    { href: "/admin/products/new", label: t.admin.sidebarAddProduct, icon: PackagePlus },
    { href: "/admin/products", label: t.admin.sidebarProductList, icon: Coffee },
  ];

  const items = role === "ADMIN" ? adminNav : karyawanNav;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-espresso-900 text-espresso-100 lg:flex">
      <div className="flex h-16 items-center px-6 border-b border-espresso-800">
        <Logo light href="/admin" size="sm" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-espresso-400">
          {role === "ADMIN" ? t.admin.adminMenu : t.admin.staffMenu}
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-loading-message={`Membuka ${item.label}...`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-caramel-600 text-white font-semibold"
                    : "text-espresso-200 hover:bg-espresso-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-espresso-800 p-4">
        <form action={adminLogout} data-loading-message="Logging out...">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-300 hover:bg-espresso-800 hover:text-rose-200"
          >
            <LogOut className="h-4 w-4" /> {t.admin.logout}
          </button>
        </form>
      </div>
    </aside>
  );
}
