"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  User,
  ShieldCheck,
  Truck,
  Clock,
  CheckCircle2,
  RotateCw,
  MapPin,
  Phone,
  Mail,
  Copy,
  Check,
  ArrowRight,
  Search,
  ShoppingBag,
  LogOut,
  Coffee,
  MessageCircle,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useLoading } from "@/components/loading-provider";
import { formatCurrency, type CurrencySettings, DEFAULT_CURRENCY } from "@/lib/currency";
import { type AllSettings, getStoreWhatsApp } from "@/lib/settings-types";
import { useI18n } from "@/i18n/provider";
import { formatDate, ORDER_STATUS_LABEL, ORDER_STATUS_STYLE, getOrderStatusLabel, getPaymentLabel } from "@/lib/utils";
import { logout } from "@/actions/auth";
import { AccountProfileForm } from "@/components/shop/account-profile-form";
import { AccountPasswordForm } from "@/components/shop/account-password-form";
import { MidtransPayButton } from "@/components/shop/midtrans-pay-button";
import { isMidtransPayment } from "@/lib/midtrans-channels";
import { OrderTrackingModal } from "@/components/shop/order-tracking-modal";
import { resolveEffectiveCourier } from "@/lib/tracking-constants";

export type OrderItemType = {
  id: string;
  productName: string;
  variantName?: string | null;
  price: number;
  quantity: number;
  total: number;
  product?: {
    image?: string | null;
    slug?: string | null;
  } | null;
};

export type OrderType = {
  id: string;
  orderNo: string;
  status: string;
  total: number;
  shippingMethod: string;
  trackingNumber?: string | null;
  courierCode?: string | null;
  courierName?: string | null;
  trackingStatus?: string | null;
  trackingHistory?: string | null;
  paymentMethod: string;
  createdAt: Date | string;
  items: OrderItemType[];
};

export type UserType = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  role: string;
  createdAt: Date | string;
};

type MemberAreaViewProps = {
  user: UserType;
  orders: OrderType[];
  settings: AllSettings;
  initialTab?: string;
};

export function MemberAreaView({
  user,
  orders,
  settings,
  initialTab = "dashboard",
}: MemberAreaViewProps) {
  const { showLoading, hideLoading } = useLoading();
  const { t, locale } = useI18n();
  const isEn = locale === "en";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [pageSize, setPageSize] = useState<string>("20");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [copiedResi, setCopiedResi] = useState<string | null>(null);

  const currencyConfig: CurrencySettings = settings?.currency || DEFAULT_CURRENCY;

  // Hitung jumlah status pesanan
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const processingOrders = orders.filter((o) => o.status === "PAID" || o.status === "PROCESSING");
  const shippedOrders = orders.filter((o) => o.status === "SHIPPED");
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");

  // Filter pesanan pada tab Pesanan Saya
  const filteredOrders = orders.filter((order) => {
    // Filter Status
    if (statusFilter === "PENDING" && order.status !== "PENDING") return false;
    if (statusFilter === "PROCESSING" && order.status !== "PAID" && order.status !== "PROCESSING") return false;
    if (statusFilter === "SHIPPED" && order.status !== "SHIPPED") return false;
    if (statusFilter === "COMPLETED" && order.status !== "COMPLETED") return false;
    if (statusFilter === "CANCELLED" && order.status !== "CANCELLED") return false;

    // Filter Pencarian
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      const matchNo = order.orderNo.toLowerCase().includes(q);
      const matchItem = order.items.some((it) => it.productName.toLowerCase().includes(q));
      const matchAwb = order.trackingNumber ? order.trackingNumber.toLowerCase().includes(q) : false;
      return matchNo || matchItem || matchAwb;
    }

    return true;
  });

  // Perhitungan Pagination
  const effectivePageSize =
    pageSize === "ALL" ? Math.max(1, filteredOrders.length) : parseInt(pageSize, 10) || 20;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / effectivePageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * effectivePageSize;
  const paginatedOrders =
    pageSize === "ALL"
      ? filteredOrders
      : filteredOrders.slice(startIndex, startIndex + effectivePageSize);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === validCurrentPage) return;
    showLoading(isEn ? `Loading page ${newPage}...` : `Memuat halaman ${newPage}...`);
    setTimeout(() => {
      setCurrentPage(newPage);
      hideLoading();
    }, 280);
  };

  const handlePageSizeChange = (newSize: string) => {
    if (newSize === pageSize) return;
    const label = newSize === "ALL" ? (isEn ? "all" : "semua") : newSize;
    showLoading(isEn ? `Showing ${label} orders...` : `Menampilkan ${label} data pesanan...`);
    setTimeout(() => {
      setPageSize(newSize);
      setCurrentPage(1);
      hideLoading();
    }, 280);
  };

  const handleResetFilters = () => {
    showLoading(isEn ? "Resetting filters..." : "Mereset filter pesanan...");
    setTimeout(() => {
      setOrderSearch("");
      setStatusFilter("ALL");
      setPageSize("20");
      setCurrentPage(1);
      hideLoading();
    }, 280);
  };

  const handleStatusFilterChange = (status: string) => {
    if (status === statusFilter) return;
    showLoading(isEn ? "Filtering orders..." : "Menyaring daftar pesanan...");
    setTimeout(() => {
      setStatusFilter(status);
      setCurrentPage(1);
      hideLoading();
    }, 250);
  };

  const getPaginationNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, "...", total];
    }
    if (current >= total - 3) {
      return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, "...", current - 1, current, current + 1, "...", total];
  };

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    setTimeout(() => setCopiedResi(null), 2000);
  };

  // Pesanan paling baru untuk widget aktif
  const latestOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* Header Profil & Ringkasan Akun */}
      <div className="rounded-2xl border border-espresso-800 bg-espresso-900 p-6 md:p-8 text-white shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-5">
            {/* Avatar Inisial */}
            <div className="flex h-16 w-16 md:h-18 md:w-18 shrink-0 items-center justify-center rounded-2xl bg-caramel-600 text-white font-bold text-2xl md:text-3xl shadow-inner border border-caramel-400/30">
              {user.name ? user.name.charAt(0).toUpperCase() : "M"}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                  {user.name}
                </h1>
                <span className="rounded-full bg-caramel-500/20 border border-caramel-400/30 px-2.5 py-0.5 text-[11px] font-semibold text-caramel-300">
                  Member Wazzopi
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-cream/80">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-caramel-400" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-caramel-400" />
                    {user.phone}
                  </span>
                )}
                {user.city && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-caramel-400" />
                    {user.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-xl bg-caramel-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-caramel-500 transition-colors shadow-xs"
            >
              <ShoppingBag className="h-4 w-4" />
              {isEn ? "Shop Coffee" : "Belanja Kopi"}
            </Link>

            <form action={logout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-cream hover:bg-rose-500/20 hover:border-rose-400/40 hover:text-white transition-colors cursor-pointer"
                title={isEn ? "Log out of account" : "Keluar dari akun"}
              >
                <LogOut className="h-4 w-4" />
                {isEn ? "Log Out" : "Keluar"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Menu + Tab Content */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigasi Menu Member (Sidebar di Desktop, Tab Bar di Mobile) */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border border-latte bg-white p-3 shadow-xs sticky top-24">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-espresso-400 hidden lg:block">
              {isEn ? "Member Area Menu" : "Menu Member Area"}
            </div>

            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 scrollbar-none">
              {/* Menu 1: Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-caramel-600 text-white shadow-2xs font-bold"
                    : "text-espresso-700 hover:bg-espresso-50 hover:text-espresso-950"
                }`}
              >
                <LayoutDashboard className={`h-4 w-4 ${activeTab === "dashboard" ? "text-white" : "text-caramel-600"}`} />
                <span>Dashboard</span>
              </button>

              {/* Menu 2: Pesanan Saya */}
              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`flex shrink-0 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-caramel-600 text-white shadow-2xs font-bold"
                    : "text-espresso-700 hover:bg-espresso-50 hover:text-espresso-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className={`h-4 w-4 ${activeTab === "orders" ? "text-white" : "text-caramel-600"}`} />
                  <span>{isEn ? "My Orders" : "Pesanan Saya"}</span>
                </div>
                {pendingOrders.length > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      activeTab === "orders"
                        ? "bg-white text-caramel-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {pendingOrders.length}
                  </span>
                )}
              </button>

              {/* Menu 3: Profil & Alamat */}
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-caramel-600 text-white shadow-2xs font-bold"
                    : "text-espresso-700 hover:bg-espresso-50 hover:text-espresso-950"
                }`}
              >
                <User className={`h-4 w-4 ${activeTab === "profile" ? "text-white" : "text-caramel-600"}`} />
                <span>{isEn ? "Profile & Address" : "Profil & Alamat"}</span>
              </button>

              {/* Menu 4: Keamanan Akun */}
              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "bg-caramel-600 text-white shadow-2xs font-bold"
                    : "text-espresso-700 hover:bg-espresso-50 hover:text-espresso-950"
                }`}
              >
                <ShieldCheck className={`h-4 w-4 ${activeTab === "security" ? "text-white" : "text-caramel-600"}`} />
                <span>{isEn ? "Account Security" : "Keamanan Akun"}</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Konten Tab Aktif */}
        <main className="lg:col-span-9 space-y-6">
          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD */}
          {/* ========================================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 4 Kartu Metrik Status Cepat */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                {/* Menunggu Pembayaran */}
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("PENDING");
                    setActiveTab("orders");
                  }}
                  className="text-left rounded-2xl border border-amber-200 bg-amber-50/60 p-4 transition-all hover:bg-amber-50 hover:border-amber-300 hover:shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-900">{isEn ? "Unpaid" : "Belum Bayar"}</span>
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-display text-amber-950">
                    {pendingOrders.length}
                  </p>
                  <span className="mt-1 inline-block text-[10px] text-amber-700 font-medium group-hover:underline">
                    {pendingOrders.length > 0 ? (isEn ? "Action required →" : "Perlu diselesaikan ->") : (isEn ? "No unpaid orders" : "Tidak ada tagihan")}
                  </span>
                </button>

                {/* Sedang Diproses */}
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("PROCESSING");
                    setActiveTab("orders");
                  }}
                  className="text-left rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 transition-all hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-900">{isEn ? "Processing" : "Diproses"}</span>
                    <RotateCw className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-display text-indigo-950">
                    {processingOrders.length}
                  </p>
                  <span className="mt-1 inline-block text-[10px] text-indigo-700 font-medium group-hover:underline">
                    {isEn ? "Being prepared" : "Pesanan disiapkan"}
                  </span>
                </button>

                {/* Dalam Pengiriman */}
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("SHIPPED");
                    setActiveTab("orders");
                  }}
                  className="text-left rounded-2xl border border-caramel-200 bg-caramel-50/60 p-4 transition-all hover:bg-caramel-50 hover:border-caramel-300 hover:shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-caramel-900">{isEn ? "Shipped" : "Dikirim"}</span>
                    <Truck className="h-4 w-4 text-caramel-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-display text-caramel-950">
                    {shippedOrders.length}
                  </p>
                  <span className="mt-1 inline-block text-[10px] text-caramel-700 font-medium group-hover:underline">
                    {isEn ? "With courier" : "Diantar kurir"}
                  </span>
                </button>

                {/* Pesanan Selesai */}
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("COMPLETED");
                    setActiveTab("orders");
                  }}
                  className="text-left rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 transition-all hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-900">{isEn ? "Completed" : "Selesai"}</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold font-display text-emerald-950">
                    {completedOrders.length}
                  </p>
                  <span className="mt-1 inline-block text-[10px] text-emerald-700 font-medium group-hover:underline">
                    {isEn ? "Successful orders" : "Transaksi sukses"}
                  </span>
                </button>
              </div>

              {/* Widget Pesanan Terkini & Pelacakan Cepat */}
              {latestOrder ? (
                (() => {
                  const effective = latestOrder.trackingNumber
                    ? resolveEffectiveCourier({
                        trackingNumber: latestOrder.trackingNumber,
                        courierCode: latestOrder.courierCode,
                        courierName: latestOrder.courierName,
                        shippingMethod: latestOrder.shippingMethod,
                        locale,
                      })
                    : null;

                  return (
                    <div className="rounded-2xl border border-latte bg-white p-6 shadow-xs">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-latte pb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-caramel-50 border border-caramel-200 text-caramel-700">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-espresso-400 uppercase tracking-wider block">
                              {isEn ? "Recent Order" : "Pesanan Terkini"}
                            </span>
                            <span className="font-mono text-sm font-bold text-espresso-900">
                              #{latestOrder.orderNo}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              ORDER_STATUS_STYLE[latestOrder.status] || "bg-latte text-espresso-800"
                            }`}
                          >
                            {getOrderStatusLabel(latestOrder.status, locale)}
                          </span>
                          <span className="text-xs text-espresso-400">
                            {formatDate(latestOrder.createdAt, true, locale)}
                          </span>
                        </div>
                      </div>

                      {/* Item Preview */}
                      <div className="py-4 border-b border-latte divide-y divide-latte/60">
                        {latestOrder.items.slice(0, 2).map((it) => (
                          <div key={it.id} className="flex items-center justify-between py-2 text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-espresso-50 border border-latte text-espresso-400 shrink-0">
                                <Coffee className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="font-medium text-espresso-900 block">
                                  {it.productName}
                                </span>
                                <span className="text-[11px] text-espresso-500">
                                  {it.variantName ? `${it.variantName} • ` : ""}Qty: {it.quantity}
                                </span>
                              </div>
                            </div>
                            <span className="font-semibold text-espresso-900">
                              {formatCurrency(it.total, currencyConfig)}
                            </span>
                          </div>
                        ))}

                        {latestOrder.items.length > 2 && (
                          <p className="text-[11px] text-espresso-400 pt-2 italic">
                            {isEn
                              ? `+ ${latestOrder.items.length - 2} other products in this order`
                              : `+ ${latestOrder.items.length - 2} produk lainnya dalam pesanan ini`}
                          </p>
                        )}
                      </div>

                      {/* Detail Resi & Pengiriman Jika Ada */}
                      {latestOrder.trackingNumber && effective && (
                        <div className="py-3 border-b border-latte/60 space-y-2 bg-latte/20 -mx-6 px-6">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-[11px] text-espresso-500">
                                {isEn ? "Courier:" : "Ekspedisi Pengiriman:"} <strong>{effective.courierName}</strong>
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-xs font-bold text-caramel-700 bg-white px-2 py-0.5 rounded border border-latte">
                                  {latestOrder.trackingNumber}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyResi(latestOrder.trackingNumber!)}
                                  className="inline-flex items-center gap-1 text-[11px] text-espresso-600 hover:text-caramel-600 transition-colors font-medium cursor-pointer"
                                >
                                  {copiedResi === latestOrder.trackingNumber ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-600" />
                                      <span className="text-emerald-600">{isEn ? "Copied" : "Disalin"}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>{isEn ? "Copy" : "Salin"}</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            <OrderTrackingModal
                              orderId={latestOrder.id}
                              orderNo={latestOrder.orderNo}
                              courierCode={latestOrder.courierCode}
                              courierName={effective.courierName}
                              trackingNumber={latestOrder.trackingNumber}
                              status={latestOrder.status}
                              trackingStatus={latestOrder.trackingStatus}
                              shippingMethod={latestOrder.shippingMethod}
                              history={(() => {
                                try {
                                  return latestOrder.trackingHistory
                                    ? JSON.parse(latestOrder.trackingHistory)
                                    : [];
                                } catch {
                                  return [];
                                }
                              })()}
                              isCustomerView={true}
                            />
                          </div>

                          {effective.isCourierSwitched && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/70 rounded-md px-2.5 py-1">
                              <strong className="font-semibold text-amber-950">{isEn ? "Shipping Notice: " : "Catatan Pengiriman: "}</strong>
                              {effective.customerNotice || (isEn ? `Your package is being shipped via ${effective.courierName} to ensure an optimal delivery route to your address at no extra cost.` : `Paket Anda dikirim menggunakan ${effective.courierName} untuk rute pengantaran yang lebih optimal tanpa biaya tambahan.`)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-xs text-espresso-500 block">{isEn ? "Total Amount:" : "Total Pembayaran:"}</span>
                          <span className="text-base font-bold font-display text-espresso-900">
                            {formatCurrency(latestOrder.total, currencyConfig)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          {isMidtransPayment(latestOrder.paymentMethod) && latestOrder.status === "PENDING" && (
                            <MidtransPayButton
                              orderNo={latestOrder.orderNo}
                              buttonLabel={isEn ? "Pay Now" : "Bayar Sekarang"}
                              variant="secondary"
                              className="py-2 px-3 text-xs"
                            />
                          )}

                          {latestOrder.paymentMethod === "bank_transfer" && latestOrder.status === "PENDING" && (
                            <Link
                              href={`/checkout/success/${latestOrder.orderNo}`}
                              className="inline-flex items-center gap-1 rounded-lg bg-caramel-50 px-3 py-2 text-xs font-semibold text-caramel-700 border border-caramel-200 hover:bg-caramel-100 transition-colors"
                            >
                              {isEn ? "Payment Guide →" : "Petunjuk Bayar →"}
                            </Link>
                          )}

                          <Link
                            href={`/checkout/success/${latestOrder.orderNo}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-espresso-200 bg-white px-3.5 py-2 text-xs font-semibold text-espresso-800 hover:bg-espresso-50 transition-colors shadow-2xs"
                          >
                            <span>{isEn ? "Order Details" : "Rincian Pesanan"}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="rounded-2xl border border-latte bg-white p-8 text-center shadow-xs">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-espresso-50 border border-latte text-espresso-400 mb-3">
                    <Package className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-espresso-900">
                    {isEn ? "No Order History Yet" : "Belum Ada Riwayat Pesanan"}
                  </h3>
                  <p className="mt-1 text-xs text-espresso-500 max-w-sm mx-auto">
                    {isEn
                      ? "Browse our freshly roasted specialty coffees and brewing gear to place your first order."
                      : "Koleksi biji kopi segar dan produk Wazzopi siap dikirimkan ke alamat Anda."}
                  </p>
                  <Link
                    href="/products"
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-caramel-600 px-4 py-2 text-xs font-semibold text-white hover:bg-caramel-500 transition-colors"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {isEn ? "Start Shopping" : "Mulai Belanja Kopi"}
                  </Link>
                </div>
              )}

              {/* 2 Kolom Ringkasan Tambahan: Alamat & Bantuan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Alamat Utama */}
                <div className="rounded-2xl border border-latte bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-latte">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-espresso-400 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-caramel-600" />
                        {isEn ? "Primary Shipping Address" : "Alamat Pengiriman Utama"}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setActiveTab("profile")}
                        className="text-xs font-semibold text-caramel-700 hover:underline cursor-pointer"
                      >
                        {isEn ? "Edit Address" : "Ubah Alamat"}
                      </button>
                    </div>

                    <div className="mt-3 text-xs space-y-1">
                      <p className="font-bold text-espresso-900">{user.name}</p>
                      {user.phone && <p className="text-espresso-600 font-mono">{user.phone}</p>}
                      {user.address ? (
                        <p className="text-espresso-700 leading-relaxed mt-1">
                          {user.address}
                          {user.city ? `, ${user.city}` : ""}
                          {user.province ? `, ${user.province}` : ""}
                          {user.postalCode ? ` ${user.postalCode}` : ""}
                        </p>
                      ) : (
                        <p className="text-espresso-400 italic mt-1">
                          {isEn
                            ? "Street address not set yet. Complete to expedite checkout."
                            : "Alamat lengkap belum diatur. Lengkapi untuk mempermudah proses checkout."}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-latte/60">
                    <button
                      type="button"
                      onClick={() => setActiveTab("profile")}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-latte bg-espresso-50/50 py-2 text-xs font-semibold text-espresso-700 hover:bg-espresso-100 transition-colors cursor-pointer"
                    >
                      {isEn ? "Manage Full Address" : "Kelola Alamat Lengkap"}
                    </button>
                  </div>
                </div>

                {/* Bantuan & WhatsApp Customer Service */}
                <div className="rounded-2xl border border-latte bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-latte">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-espresso-400 flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        {isEn ? "Customer Support Center" : "Pusat Bantuan & Layanan"}
                      </h4>
                    </div>

                    <p className="mt-3 text-xs text-espresso-600 leading-relaxed">
                      {isEn
                        ? "Have questions regarding orders, tracking, or need brewing recommendations? Our team is happy to assist."
                        : "Memiliki pertanyaan seputar pesanan, rute pengiriman, atau ingin berkonsultasi mengenai rekomendasi biji kopi Wazzopi? Tim kami siap membantu."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-latte/60">
                    <a
                      href={`https://wa.me/${getStoreWhatsApp(settings)}?text=${encodeURIComponent(
                        isEn
                          ? `Hello ${settings.general.storeName} Support, I am ${user.name} inquiring about an order.`
                          : `Halo Admin Wazzopi, saya ${user.name} ingin bertanya seputar pesanan.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      {isEn ? "Chat WhatsApp Support" : "Chat WhatsApp Admin"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: PESANAN SAYA */}
          {/* ========================================================= */}
          {activeTab === "orders" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="rounded-2xl border border-latte bg-white p-5 shadow-xs space-y-4">
                {/* Header & Search + Tombol Reset */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-espresso-900">
                      {isEn ? "My Order History" : "Riwayat Pesanan Saya"}
                    </h2>
                    <p className="text-xs text-espresso-500">
                      {isEn
                        ? "Manage and track all your order statuses and shipping deliveries."
                        : "Kelola dan pantau seluruh status pesanan serta riwayat pengiriman Anda."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative min-w-[200px] sm:min-w-[240px]">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-espresso-400" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => {
                          setOrderSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder={isEn ? "Search Order No. / Product..." : "Cari No. Pesanan / Produk..."}
                        className="w-full rounded-xl border border-latte bg-espresso-50/50 pl-8 pr-3 py-1.5 text-xs text-espresso-900 placeholder:text-espresso-400 focus:bg-white focus:border-caramel-500 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-espresso-200 bg-white px-3 py-1.5 text-xs font-semibold text-espresso-700 hover:bg-espresso-100 hover:text-espresso-900 transition-colors shadow-2xs shrink-0 cursor-pointer"
                      title={isEn ? "Reset search and filters" : "Reset semua filter dan pencarian"}
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-espresso-500" />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Filter Status Pills & Show Data */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-latte pt-3">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: "ALL", label: isEn ? "All" : "Semua", count: orders.length },
                      { id: "PENDING", label: isEn ? "Unpaid" : "Belum Bayar", count: pendingOrders.length },
                      { id: "PROCESSING", label: isEn ? "Processing" : "Diproses", count: processingOrders.length },
                      { id: "SHIPPED", label: isEn ? "Shipped" : "Dikirim", count: shippedOrders.length },
                      { id: "COMPLETED", label: isEn ? "Completed" : "Selesai", count: completedOrders.length },
                      { id: "CANCELLED", label: isEn ? "Cancelled" : "Dibatalkan", count: cancelledOrders.length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleStatusFilterChange(tab.id)}
                        className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                          statusFilter === tab.id
                            ? "bg-espresso-900 text-white shadow-2xs"
                            : "bg-espresso-50 text-espresso-600 hover:bg-espresso-100"
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                            statusFilter === tab.id ? "bg-white/20 text-white" : "bg-espresso-200/60 text-espresso-700"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Show Data Selector */}
                  <div className="flex items-center gap-2 text-xs shrink-0 ml-auto">
                    <span className="text-espresso-500 font-medium">Show Data:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(e.target.value)}
                      className="rounded-lg border border-latte bg-white px-2.5 py-1 text-xs font-semibold text-espresso-900 focus:border-caramel-500 focus:outline-hidden shadow-2xs cursor-pointer"
                    >
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="ALL">All</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Daftar Kartu Pesanan */}
              {filteredOrders.length === 0 ? (
                <div className="rounded-2xl border border-latte bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-espresso-50 border border-latte text-espresso-400 mb-3">
                    <Package className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-espresso-900">
                    {isEn ? "No Orders Found" : "Tidak Ditemukan Pesanan"}
                  </h3>
                  <p className="mt-1 text-xs text-espresso-500 max-w-sm mx-auto">
                    {orderSearch
                      ? (isEn
                          ? `No orders matching query "${orderSearch}".`
                          : `Tidak ada pesanan yang sesuai dengan kata kunci "${orderSearch}".`)
                      : (isEn
                          ? "No orders found under this status filter."
                          : "Belum ada pesanan pada kategori status ini.")}
                  </p>
                  {(orderSearch || statusFilter !== "ALL") && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrderSearch("");
                        setStatusFilter("ALL");
                      }}
                      className="mt-3 text-xs font-semibold text-caramel-700 hover:underline cursor-pointer"
                    >
                      {isEn ? "Reset Filter" : "Reset Filter"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedOrders.map((order) => {
                    const effective = order.trackingNumber
                      ? resolveEffectiveCourier({
                          trackingNumber: order.trackingNumber,
                          courierCode: order.courierCode,
                          courierName: order.courierName,
                          shippingMethod: order.shippingMethod,
                          locale,
                        })
                      : null;

                    return (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-latte bg-white p-5 shadow-xs transition-all hover:border-espresso-300 space-y-4"
                      >
                        {/* Header Pesanan */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-latte pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-sm font-bold text-espresso-900">
                              #{order.orderNo}
                            </span>
                            <span className="text-xs text-espresso-400">•</span>
                            <span className="text-xs text-espresso-500">
                              {formatDate(order.createdAt, true, locale)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                ORDER_STATUS_STYLE[order.status] || "bg-latte text-espresso-800"
                              }`}
                            >
                              {getOrderStatusLabel(order.status, locale)}
                            </span>
                          </div>
                        </div>

                        {/* Item List */}
                        <div className="divide-y divide-latte/60">
                          {order.items.map((it) => (
                            <div key={it.id} className="flex items-center justify-between py-2.5 text-xs">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-espresso-50 border border-latte text-espresso-400 shrink-0 overflow-hidden">
                                  {it.product?.image ? (
                                    <Image
                                      src={it.product.image}
                                      alt={it.productName}
                                      width={40}
                                      height={40}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <Coffee className="h-4 w-4" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-espresso-900 block">
                                    {it.productName}
                                  </span>
                                  <span className="text-[11px] text-espresso-500">
                                    {it.variantName ? `${it.variantName} • ` : ""}Qty: {it.quantity} x {formatCurrency(it.price, currencyConfig)}
                                  </span>
                                </div>
                              </div>

                              <span className="font-bold text-espresso-900">
                                {formatCurrency(it.total, currencyConfig)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Pengiriman & Waybill */}
                        <div className="rounded-xl bg-latte/30 p-3.5 border border-latte/80 text-xs space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-espresso-500 block text-[11px]">
                                {isEn ? "Courier:" : "Kurir Pengiriman:"} {order.shippingMethod}
                              </span>
                              {order.trackingNumber && effective && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-xs font-bold text-caramel-700 bg-white px-2 py-0.5 rounded border border-latte">
                                    {order.trackingNumber}
                                  </span>
                                  <span className="text-xs font-semibold text-espresso-800">
                                    ({effective.courierName})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyResi(order.trackingNumber!)}
                                    className="inline-flex items-center gap-1 text-[11px] text-espresso-600 hover:text-caramel-600 transition-colors font-medium ml-1 cursor-pointer"
                                  >
                                    {copiedResi === order.trackingNumber ? (
                                      <>
                                        <Check className="h-3 w-3 text-emerald-600" />
                                        <span className="text-emerald-600">{isEn ? "Copied" : "Disalin"}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3" />
                                        <span>{isEn ? "Copy" : "Salin"}</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>

                            {order.trackingNumber && effective && (
                              <OrderTrackingModal
                                orderId={order.id}
                                orderNo={order.orderNo}
                                courierCode={order.courierCode}
                                courierName={effective.courierName}
                                trackingNumber={order.trackingNumber}
                                status={order.status}
                                trackingStatus={order.trackingStatus}
                                shippingMethod={order.shippingMethod}
                                history={(() => {
                                  try {
                                    return order.trackingHistory
                                      ? JSON.parse(order.trackingHistory)
                                      : [];
                                } catch {
                                  return [];
                                }
                              })()}
                              isCustomerView={true}
                            />
                            )}
                          </div>

                          {effective?.isCourierSwitched && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/70 rounded px-2 py-0.5 mt-1 inline-block">
                              <strong className="font-semibold text-amber-950">{isEn ? "Shipping Notice: " : "Catatan Pengiriman: "}</strong>
                              {effective.customerNotice || (isEn ? `Routed via ${effective.courierName} for an optimal delivery route at no extra cost.` : `Dialihkan ke ${effective.courierName} untuk rute pengantaran lebih optimal.`)}
                            </p>
                          )}
                        </div>

                        {/* Footer & Tombol Aksi */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <div>
                            <span className="text-xs text-espresso-500">{isEn ? "Total Amount: " : "Total Pesanan: "}</span>
                            <span className="font-display font-bold text-sm text-espresso-900">
                              {formatCurrency(order.total, currencyConfig)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {isMidtransPayment(order.paymentMethod) && order.status === "PENDING" && (
                              <MidtransPayButton
                                orderNo={order.orderNo}
                                buttonLabel={isEn ? "Pay Now" : "Lanjutkan Pembayaran"}
                                variant="secondary"
                                className="py-2 px-3 text-xs shadow-xs"
                              />
                            )}

                            {order.paymentMethod === "bank_transfer" && order.status === "PENDING" && (
                              <Link
                                href={`/checkout/success/${order.orderNo}`}
                                className="inline-flex items-center gap-1 rounded-lg bg-caramel-50 px-3 py-2 text-xs font-semibold text-caramel-700 border border-caramel-200 hover:bg-caramel-100 transition-colors"
                              >
                                {isEn ? "Bank Instructions →" : "Petunjuk Transfer →"}
                              </Link>
                            )}

                            <Link
                              href={`/checkout/success/${order.orderNo}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-espresso-200 bg-white px-3.5 py-2 text-xs font-semibold text-espresso-800 hover:bg-espresso-50 transition-colors"
                            >
                              <span>{isEn ? "Order Details" : "Rincian Pesanan"}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Footer Controls */}
              {filteredOrders.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-latte bg-white p-4 shadow-xs">
                  {/* Keterangan & Show Data di footer */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-espresso-600">
                    <span>
                      {isEn ? (
                        <>
                          Showing <strong>{filteredOrders.length > 0 ? startIndex + 1 : 0}</strong> –{" "}
                          <strong>{Math.min(startIndex + effectivePageSize, filteredOrders.length)}</strong> of{" "}
                          <strong>{filteredOrders.length}</strong> orders
                        </>
                      ) : (
                        <>
                          Menampilkan <strong>{filteredOrders.length > 0 ? startIndex + 1 : 0}</strong> –{" "}
                          <strong>{Math.min(startIndex + effectivePageSize, filteredOrders.length)}</strong> dari total{" "}
                          <strong>{filteredOrders.length}</strong> pesanan
                        </>
                      )}
                    </span>
                    <span className="text-espresso-300">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-espresso-500 font-medium">Show:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                        className="rounded-lg border border-latte bg-espresso-50/50 px-2 py-0.5 text-xs font-semibold text-espresso-900 focus:bg-white focus:border-caramel-500 focus:outline-hidden cursor-pointer"
                      >
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="ALL">All</option>
                      </select>
                    </div>
                  </div>

                  {/* Pagination Numbers */}
                  {pageSize !== "ALL" && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {/* Tombol Sebelumnya */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(validCurrentPage - 1)}
                        disabled={validCurrentPage <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-600 hover:bg-espresso-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title={isEn ? "Previous page" : "Halaman sebelumnya"}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {/* Nomor-nomor Halaman */}
                      {getPaginationNumbers(validCurrentPage, totalPages).map((p, idx) =>
                        typeof p === "number" ? (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                              validCurrentPage === p
                                ? "bg-espresso-900 text-white font-bold shadow-2xs"
                                : "border border-latte bg-white text-espresso-700 hover:bg-espresso-50"
                            }`}
                          >
                            {p}
                          </button>
                        ) : (
                          <span
                            key={idx}
                            className="px-1 text-xs text-espresso-400 font-bold select-none"
                          >
                            ...
                          </span>
                        )
                      )}

                      {/* Tombol Selanjutnya */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(validCurrentPage + 1)}
                        disabled={validCurrentPage >= totalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-latte bg-white text-espresso-600 hover:bg-espresso-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        title={isEn ? "Next page" : "Halaman selanjutnya"}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PROFIL & ALAMAT */}
          {/* ========================================================= */}
          {activeTab === "profile" && (
            <div className="rounded-2xl border border-latte bg-white p-6 md:p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-latte pb-4">
                <h2 className="text-base font-bold text-espresso-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-caramel-600" />
                  {isEn ? "Profile & Primary Delivery Address" : "Profil & Alamat Pengiriman Utama"}
                </h2>
                <p className="mt-1 text-xs text-espresso-500">
                  {isEn
                    ? "This information is used as your default shipping destination when placing orders at Wazzopi."
                    : "Data ini digunakan sebagai alamat tujuan default ketika Anda melakukan pemesanan di Wazzopi."}
                </p>
              </div>

              <AccountProfileForm
                user={{
                  name: user.name,
                  phone: user.phone ?? null,
                  address: user.address ?? null,
                  city: user.city ?? null,
                  province: user.province ?? null,
                  postalCode: user.postalCode ?? null,
                }}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: KEAMANAN AKUN */}
          {/* ========================================================= */}
          {activeTab === "security" && (
            <div className="rounded-2xl border border-latte bg-white p-6 md:p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-latte pb-4">
                <h2 className="text-base font-bold text-espresso-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-caramel-600" />
                  {isEn ? "Account Security & Password" : "Keamanan & Kata Sandi Akun"}
                </h2>
                <p className="mt-1 text-xs text-espresso-500">
                  {isEn
                    ? "Ensure your password is strong and kept confidential to protect your shopping account."
                    : "Pastikan kata sandi Anda kuat dan tidak dibagikan kepada siapa pun demi keamanan akun belanja Anda."}
                </p>
              </div>

              <div className="max-w-md">
                <AccountPasswordForm />
              </div>

              <div className="rounded-xl border border-espresso-100 bg-espresso-50/50 p-4 text-xs text-espresso-600 space-y-1.5">
                <span className="font-bold text-espresso-800 block">
                  {isEn ? "Account Security Tips:" : "Tips Keamanan Akun:"}
                </span>
                <p>
                  {isEn
                    ? "• Use at least 8 characters with a mix of uppercase, lowercase letters, and numbers."
                    : "• Gunakan minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, dan angka."}
                </p>
                <p>
                  {isEn
                    ? "• Avoid using birthdates or easily guessed words."
                    : "• Hindari menggunakan tanggal lahir atau kata yang mudah ditebak."}
                </p>
                <p>
                  {isEn
                    ? "• Update your password immediately if you notice any suspicious activity on your account."
                    : "• Segera perbarui kata sandi jika Anda merasa ada aktivitas mencurigakan pada akun Anda."}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}