"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Calendar, Download, TrendingUp } from "lucide-react";
import { formatCurrency, type CurrencySettings } from "@/lib/currency";
import { formatDate, SALES_STATUSES } from "@/lib/utils";

type OrderRecord = {
  id: string;
  orderNo: string;
  customerName: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  createdAt: Date;
};

export function ReportsView({
  orders,
  currency,
}: {
  orders: OrderRecord[];
  currency: CurrencySettings;
}) {
  const [tab, setTab] = useState<"daily" | "monthly" | "yearly">("daily");

  // Default Range A: 30 hari terakhir
  const now = new Date();
  const defStartA = new Date(now.getTime() - 29 * 86400000).toISOString().slice(0, 10);
  const defEndA = now.toISOString().slice(0, 10);

  // Default Range B: 30 hari sebelumnya untuk komparasi
  const defStartB = new Date(now.getTime() - 59 * 86400000).toISOString().slice(0, 10);
  const defEndB = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);

  const [rangeA, setRangeA] = useState({ start: defStartA, end: defEndA });
  const [rangeB, setRangeB] = useState({ start: defStartB, end: defEndB });

  // Filter orders berdasarkan range A
  const ordersA = useMemo(() => {
    const s = new Date(rangeA.start).getTime();
    const e = new Date(rangeA.end).setHours(23, 59, 59, 999);
    return orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= s && t <= e && SALES_STATUSES.includes(o.status);
    });
  }, [orders, rangeA]);

  // Filter orders berdasarkan range B
  const ordersB = useMemo(() => {
    const s = new Date(rangeB.start).getTime();
    const e = new Date(rangeB.end).setHours(23, 59, 59, 999);
    return orders.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= s && t <= e && SALES_STATUSES.includes(o.status);
    });
  }, [orders, rangeB]);

  const totalRevA = ordersA.reduce((sum, o) => sum + o.total, 0);
  const totalRevB = ordersB.reduce((sum, o) => sum + o.total, 0);

  const growth =
    totalRevB > 0
      ? Math.round(((totalRevA - totalRevB) / totalRevB) * 100)
      : totalRevA > 0
      ? 100
      : 0;

  // Siapkan data perbandingan grafik
  const comparisonData = [
    {
      name: "Total Pendapatan",
      "Periode A (Utama)": totalRevA,
      "Periode B (Pembanding)": totalRevB,
    },
    {
      name: "Jumlah Pesanan",
      "Periode A (Utama)": ordersA.length,
      "Periode B (Pembanding)": ordersB.length,
    },
  ];

  // Export CSV
  function exportCSV() {
    const headers = "No. Pesanan,Tanggal,Pelanggan,Status,Subtotal,Ongkir,Total\n";
    const rows = ordersA
      .map(
        (o) =>
          `"${o.orderNo}","${formatDate(o.createdAt, true)}","${o.customerName}","${o.status}",${o.subtotal},${o.shippingCost},${o.total}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-penjualan-wazzopi-${rangeA.start}-sd-${rangeA.end}.csv`;
    a.click();
  }

  return (
    <div className="space-y-6">
      {/* Kontrol 2 Rentang Tanggal (Date Ranges) */}
      <div className="rounded-xl border border-latte bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-latte pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-caramel-500" />
            <h2 className="text-base font-bold text-espresso-900">
              Filter Dua Rentang Tanggal Komparasi
            </h2>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-espresso-200 bg-white px-3 py-1.5 text-xs font-semibold text-espresso-700 hover:bg-latte shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV (Periode A)
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Range A (Utama) */}
          <div className="rounded-lg border border-caramel-200 bg-caramel-50/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-caramel-700 block mb-2">
              Periode A (Rentang Utama)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={rangeA.start}
                onChange={(e) => setRangeA((r) => ({ ...r, start: e.target.value }))}
                className="rounded-lg border border-espresso-200 bg-white px-3 py-1.5 text-xs text-espresso-900 focus:outline-none focus:ring-1 focus:ring-caramel-500"
              />
              <span className="text-xs text-espresso-400">s/d</span>
              <input
                type="date"
                value={rangeA.end}
                onChange={(e) => setRangeA((r) => ({ ...r, end: e.target.value }))}
                className="rounded-lg border border-espresso-200 bg-white px-3 py-1.5 text-xs text-espresso-900 focus:outline-none focus:ring-1 focus:ring-caramel-500"
              />
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-espresso-600">Total Periode A:</span>
              <strong className="text-espresso-900">{formatCurrency(totalRevA, currency)}</strong>
            </div>
          </div>

          {/* Range B (Pembanding) */}
          <div className="rounded-lg border border-espresso-200 bg-espresso-50/40 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-espresso-600 block mb-2">
              Periode B (Rentang Pembanding)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={rangeB.start}
                onChange={(e) => setRangeB((r) => ({ ...r, start: e.target.value }))}
                className="rounded-lg border border-espresso-200 bg-white px-3 py-1.5 text-xs text-espresso-900 focus:outline-none focus:ring-1 focus:ring-caramel-500"
              />
              <span className="text-xs text-espresso-400">s/d</span>
              <input
                type="date"
                value={rangeB.end}
                onChange={(e) => setRangeB((r) => ({ ...r, end: e.target.value }))}
                className="rounded-lg border border-espresso-200 bg-white px-3 py-1.5 text-xs text-espresso-900 focus:outline-none focus:ring-1 focus:ring-caramel-500"
              />
            </div>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-espresso-600">Total Periode B:</span>
              <strong className="text-espresso-900">{formatCurrency(totalRevB, currency)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Kartu Ringkasan Komparasi */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-latte bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase text-espresso-400">Omzet Periode A</span>
          <p className="mt-2 font-display text-2xl font-bold text-espresso-900">
            {formatCurrency(totalRevA, currency)}
          </p>
          <p className="mt-1 text-xs text-espresso-400">{ordersA.length} transaksi</p>
        </div>

        <div className="rounded-xl border border-latte bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase text-espresso-400">Omzet Periode B</span>
          <p className="mt-2 font-display text-2xl font-bold text-espresso-900">
            {formatCurrency(totalRevB, currency)}
          </p>
          <p className="mt-1 text-xs text-espresso-400">{ordersB.length} transaksi</p>
        </div>

        <div className="rounded-xl border border-latte bg-white p-5 shadow-xs">
          <span className="text-xs font-semibold uppercase text-espresso-400">Pertumbuhan (Growth)</span>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`font-display text-2xl font-bold ${
                growth >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {growth >= 0 ? `+${growth}%` : `${growth}%`}
            </span>
            {growth >= 0 ? (
              <ArrowUpRight className="h-5 w-5 text-emerald-700" />
            ) : (
              <ArrowDownRight className="h-5 w-5 text-rose-700" />
            )}
          </div>
          <p className="mt-1 text-xs text-espresso-400">Dibandingkan Periode B</p>
        </div>
      </div>

      {/* Visualisasi Perbandingan Grafik */}
      <div className="rounded-xl border border-latte bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-espresso-900 mb-4">
          Perbandingan Omzet & Transaksi Antar-Periode
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe3d0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8f5a43" }} />
              <YAxis tick={{ fontSize: 11, fill: "#8f5a43" }} tickLine={false} axisLine={false} />
              <Tooltip
                formatter={(val) =>
                  typeof val === "number" && val > 1000 ? formatCurrency(val, currency) : val
                }
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="Periode A (Utama)" fill="#a8673c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Periode B (Pembanding)" fill="#4a2117" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
