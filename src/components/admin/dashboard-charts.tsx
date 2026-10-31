"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMoney } from "@/components/currency-provider";
import { ORDER_STATUS_LABEL, getOrderStatusLabel } from "@/lib/utils";
import { useI18n } from "@/i18n/provider";

type ChartPoint = { date: string; revenue: number; orders: number };

const COLORS = ["#f59e0b", "#0284c7", "#6366f1", "#a8673c", "#10b981", "#f43f5e"];

export function DashboardCharts({
  chartData,
  statusCounts,
}: {
  chartData: ChartPoint[];
  statusCounts: Record<string, number>;
}) {
  const money = useMoney();
  const { locale } = useI18n();
  const isEn = locale === "en";

  const pieData = Object.entries(statusCounts).map(([k, v]) => ({
    name: getOrderStatusLabel(k, locale) || k,
    value: v,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Area Chart: Pendapatan 30 Hari */}
      <div className="rounded-xl border border-latte bg-white p-6 shadow-xs lg:col-span-8">
        <h2 className="text-base font-bold text-espresso-900">{isEn ? "Sales Chart (Last 30 Days)" : "Grafik Penjualan (30 Hari Terakhir)"}</h2>
        <p className="text-xs text-espresso-400">{isEn ? "Total daily revenue" : "Total pendapatan harian"}</p>
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a8673c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a8673c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#efe3d0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8f5a43" }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#8f5a43" }}
                tickFormatter={(v) => `${v / 1000}k`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(val) => [money(Number(val)), isEn ? "Revenue" : "Pendapatan"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderColor: "#efe3d0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#a8673c"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donut Chart: Komposisi Status Pesanan */}
      <div className="rounded-xl border border-latte bg-white p-6 shadow-xs lg:col-span-4">
        <h2 className="text-base font-bold text-espresso-900">{isEn ? "Order Status" : "Status Pesanan"}</h2>
        <p className="text-xs text-espresso-400">{isEn ? "Overall status distribution" : "Distribusi status keseluruhan"}</p>
        <div className="mt-4 h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderColor: "#efe3d0",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 space-y-1.5 text-xs">
          {pieData.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-espresso-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                {p.name}
              </span>
              <span className="font-semibold text-espresso-900">{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
