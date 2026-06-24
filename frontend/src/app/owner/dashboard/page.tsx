"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  ShoppingCart,
  Star,
  TrendingDown,
} from "lucide-react";
import { BentoGrid, BentoItem } from "@/components/owner/BentoGrid";
import { MetricCard } from "@/components/owner/MetricCard";
import { TopItemsChart } from "@/components/owner/TopItemsChart";
import { LowStockCard } from "@/components/owner/LowStockCard";
import { SalesChart } from "@/components/owner/SalesChart";
import { PeriodSelector, type PeriodPreset } from "@/components/owner/PeriodSelector";
import { CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/services/api";
import { formatCurrency } from "@/lib/formatCurrency";
import type { DailySales, TopItem, InventoryItem } from "@/types";

// ── Backend API response shapes (snake_case from Go, unwrapped by api.ts) ──

interface BackendSummary {
  total_transactions: number;
  gross_revenue: number;
  total_tax: number;
  total_void: number;
  total_opex: number;
  gross_profit: number;
}

interface BackendTopItem {
  menu_item_id: string;
  item_name: string;
  total_qty: number;
  total_value: number;
}

interface BackendRawMaterial {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  updated_at?: string;
}

interface DashboardResponse {
  summary: BackendSummary;
  top_items: BackendTopItem[];
  low_stock: BackendRawMaterial[];
}

interface BackendDailySale {
  date: string;
  revenue: number;
  orders: number;
}

// ── Helpers ──

function periodToRange(period: PeriodPreset): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];

  let from: Date;
  switch (period) {
    case "this-week":
      from = new Date(now);
      from.setDate(now.getDate() - 7);
      break;
    case "this-month":
      from = new Date(now);
      from.setDate(now.getDate() - 30);
      break;
    case "this-quarter":
      from = new Date(now);
      from.setDate(now.getDate() - 90);
      break;
    case "this-year":
      from = new Date(now);
      from.setDate(now.getDate() - 365);
      break;
    default:
      from = new Date(now);
      from.setDate(now.getDate() - 30);
  }

  return { from: from.toISOString().split("T")[0], to };
}

function mapToTopItems(items: BackendTopItem[]): TopItem[] {
  const total = items.reduce((s, i) => s + i.total_qty, 0);
  return items.map((i) => ({
    menuItemId: i.menu_item_id,
    name: i.item_name,
    quantity: i.total_qty,
    revenue: i.total_value,
    percentage: total > 0 ? Math.round((i.total_qty / total) * 100) : 0,
  }));
}

function mapToInventoryItems(items: BackendRawMaterial[]): InventoryItem[] {
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    sku: "-",
    category: "Bahan Baku",
    currentStock: Math.floor(i.current_stock),
    minimumStock: Math.floor(i.minimum_stock),
    unit: i.unit,
    costPerUnit: 0,
    updatedAt: i.updated_at ?? new Date().toISOString(),
  }));
}

function mapToDailySales(sales: BackendDailySale[]): DailySales[] {
  return sales.map((s) => ({
    date: s.date,
    totalOrders: s.orders,
    totalRevenue: s.revenue,
    totalTax: 0,
    totalDiscount: 0,
    averageOrderValue: s.orders > 0 ? Math.round(s.revenue / s.orders) : 0,
  }));
}

// ── Page ──

export default function OwnerDashboardPage() {
  const [period, setPeriod] = useState<PeriodPreset>("this-month");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const range = periodToRange(period);
    try {
      const [dashboard, sales] = await Promise.all([
        api.get<DashboardResponse>("/dashboard"),
        api.get<BackendDailySale[]>(
          `/reports/sales-chart?from=${range.from}&to=${range.to}`
        ),
      ]);
      setData(dashboard);
      setDailySales(mapToDailySales(sales));
    } catch {
      setData(null);
      setDailySales([]);
    }
    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const s = data?.summary;

  // Derived values
  const totalRevenue = s?.gross_revenue ?? 0;
  const totalOrders = s?.total_transactions ?? 0;
  const avgOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const grossProfit = s?.gross_profit ?? 0;
  const totalOpex = s?.total_opex ?? 0;

  const topItems = mapToTopItems(data?.top_items ?? []);
  const lowStock = mapToInventoryItems(data?.low_stock ?? []);

  if (loading && !data) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">
            Dashboard
          </h1>
          <Badge variant="info">Auto-refresh 30s</Badge>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Metric Cards */}
      <BentoGrid cols={4}>
        <MetricCard
          icon={<DollarSign size={24} />}
          label="Gross Profit"
          value={formatCurrency(grossProfit)}
          subtitle="Pendapatan kotor periode ini"
          trend={s ? { value: 0, isPositive: true } : undefined}
          variant={grossProfit >= 0 ? "success" : "danger"}
        />
        <MetricCard
          icon={<TrendingDown size={24} />}
          label="Opex"
          value={formatCurrency(totalOpex)}
          subtitle="Total biaya operasional"
          variant="warning"
        />
        <MetricCard
          icon={<ShoppingCart size={24} />}
          label="Total Pesanan"
          value={String(totalOrders)}
          subtitle="Periode ini"
          variant="default"
        />
        <MetricCard
          icon={<Star size={24} />}
          label="Rata-rata Pesanan"
          value={formatCurrency(avgOrderValue)}
          subtitle="Per transaksi"
          variant="default"
        />
      </BentoGrid>

      {/* Charts Row */}
      <BentoGrid cols={2}>
        <BentoItem colSpan={1}>
          <CardHeader>
            <CardTitle>Penjualan Harian</CardTitle>
            <Badge variant="brand">
              {formatCurrency(totalRevenue)}
            </Badge>
          </CardHeader>
          <SalesChart data={dailySales} isLoading={loading} period="month" />
        </BentoItem>

        <BentoItem colSpan={1}>
          <CardHeader>
            <CardTitle>Item Terlaris</CardTitle>
            <Badge variant="brand">{topItems.length} item</Badge>
          </CardHeader>
          {topItems.length > 0 ? (
            <TopItemsChart items={topItems} isLoading={loading} />
          ) : (
            <p className="text-sm text-gray-500 py-8 text-center">
              Belum ada data penjualan.
            </p>
          )}
        </BentoItem>
      </BentoGrid>

      {/* Bottom Row */}
      <BentoGrid cols={2}>
        <BentoItem colSpan={1}>
          <CardHeader>
            <CardTitle>Stok Menipis</CardTitle>
            <Badge variant="danger">{lowStock.length} item</Badge>
          </CardHeader>
          {lowStock.length > 0 ? (
            <LowStockCard items={lowStock} isLoading={loading} />
          ) : (
            <p className="text-sm text-gray-500 py-8 text-center">
              Semua stok aman.
            </p>
          )}
        </BentoItem>

        <BentoItem colSpan={1}>
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
            <Badge variant="info">Live</Badge>
          </CardHeader>
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-200 dark:bg-dark-700 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-3/4 animate-pulse" />
                      <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              [
                {
                  action: "Pesanan #1024",
                  detail: "Rp 185.000 - Lunas",
                  time: "2 menit lalu",
                  type: "success" as const,
                },
                {
                  action: "Pesanan #1023",
                  detail: "Rp 92.000 - Lunas",
                  time: "5 menit lalu",
                  type: "success" as const,
                },
                {
                  action: "Stok Opname",
                  detail: "Minyak Goreng berkurang",
                  time: "10 menit lalu",
                  type: "warning" as const,
                },
                {
                  action: "Shift Tutup",
                  detail: "Kasir: Siti - Shift Pagi",
                  time: "1 jam lalu",
                  type: "info" as const,
                },
                {
                  action: "Pesanan #1018",
                  detail: "Rp 250.000 - Dibatalkan",
                  time: "2 jam lalu",
                  type: "danger" as const,
                },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "warning"
                          ? "bg-yellow-500"
                          : activity.type === "danger"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-50">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-400">
                      {activity.detail}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-dark-500 shrink-0">
                    {activity.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
