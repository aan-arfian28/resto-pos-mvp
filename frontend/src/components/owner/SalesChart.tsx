"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailySales } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";

interface SalesChartProps {
  data: DailySales[];
  isLoading?: boolean;
  period?: "week" | "month";
}

function formatDateLabel(dateStr: string, period: "week" | "month"): string {
  const d = new Date(dateStr);
  if (period === "week") {
    return d.toLocaleDateString("id-ID", { weekday: "short" });
  }
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function SalesChart({ data, isLoading = false, period = "month" }: SalesChartProps) {
  if (isLoading) {
    return (
      <div className="h-64 bg-gray-100 dark:bg-dark-700 rounded-lg animate-pulse" />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-dark-500">
        <p className="text-sm">Belum ada data penjualan</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: formatDateLabel(d.date, period),
    revenue: d.totalRevenue,
    orders: d.totalOrders,
  }));

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium text-gray-900 dark:text-dark-50 mb-1">{label}</p>
          <p className="text-gray-500 dark:text-dark-400">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-500 dark:text-dark-400">
            Orders: {payload[1]?.value || 0}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} />
          <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="revenue"
            fill="#1A5D3A"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="orders"
            fill="#81C784"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
