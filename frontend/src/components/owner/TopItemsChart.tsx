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
import type { TopItem } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";

interface TopItemsChartProps {
  items: TopItem[];
  isLoading?: boolean;
}

interface ChartData {
  name: string;
  quantity: number;
  revenue: number;
  shortName: string;
}

export function TopItemsChart({ items, isLoading = false }: TopItemsChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-dark-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-dark-500">
        <p className="text-sm">Belum ada data penjualan</p>
      </div>
    );
  }

  const chartData: ChartData[] = items.map((item) => {
    const name = (item as any).item_name || item.name || "Unknown";
    const quantity = (item as any).total_qty || item.quantity || 0;
    const revenue = (item as any).total_value || item.revenue || 0;
    return {
      name,
      shortName: name.length > 15 ? name.substring(0, 15) + "..." : name,
      quantity,
      revenue,
    };
  });

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: ChartData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg shadow-lg p-3 text-sm">
          <p className="font-medium text-gray-900 dark:text-dark-50">{data.name}</p>
          <p className="text-gray-500 dark:text-dark-400">
            Terjual: {data.quantity} pcs
          </p>
          <p className="text-gray-500 dark:text-dark-400">
            Revenue: {formatCurrency(data.revenue)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
          <YAxis
            dataKey="shortName"
            type="category"
            stroke="#9CA3AF"
            fontSize={12}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="quantity" fill="#1A5D3A" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
