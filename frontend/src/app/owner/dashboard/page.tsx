"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Star,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { BentoGrid, BentoItem } from "@/components/owner/BentoGrid";
import { MetricCard } from "@/components/owner/MetricCard";
import { TopItemsChart } from "@/components/owner/TopItemsChart";
import { LowStockCard } from "@/components/owner/LowStockCard";
import { SalesChart } from "@/components/owner/SalesChart";
import { PeriodSelector, type PeriodPreset } from "@/components/owner/PeriodSelector";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatCurrency";
import type { DailySales, TopItem, InventoryItem } from "@/types";

// Mock Data
const mockDailySales: DailySales[] = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date(2024, 5, i + 1);
  return {
    date: date.toISOString().split("T")[0],
    totalOrders: Math.floor(Math.random() * 50) + 10,
    totalRevenue: Math.floor(Math.random() * 5000000) + 500000,
    totalTax: Math.floor(Math.random() * 500000),
    totalDiscount: Math.floor(Math.random() * 100000),
    averageOrderValue: Math.floor(Math.random() * 150000) + 30000,
  };
});

const mockTopItems: TopItem[] = [
  { menuItemId: "1", name: "Nasi Goreng Spesial", quantity: 145, revenue: 4350000, percentage: 18 },
  { menuItemId: "2", name: "Mie Ayam Bakso", quantity: 120, revenue: 2400000, percentage: 15 },
  { menuItemId: "3", name: "Ayam Bakar Madu", quantity: 98, revenue: 3430000, percentage: 12 },
  { menuItemId: "4", name: "Es Teh Manis", quantity: 200, revenue: 1000000, percentage: 10 },
  { menuItemId: "5", name: "Soto Ayam", quantity: 85, revenue: 1700000, percentage: 8 },
];

const mockLowStock: InventoryItem[] = [
  { id: "1", name: "Minyak Goreng", sku: "MYK-001", category: "Bahan Pokok", currentStock: 2, minimumStock: 10, unit: "L", costPerUnit: 18000 },
  { id: "2", name: "Telur Ayam", sku: "TLR-001", category: "Protein", currentStock: 5, minimumStock: 20, unit: "Kg", costPerUnit: 28000 },
  { id: "3", name: "Bawang Merah", sku: "BWR-001", category: "Bumbu", currentStock: 3, minimumStock: 10, unit: "Kg", costPerUnit: 35000 },
  { id: "4", name: "Kecap Manis", sku: "KCP-001", category: "Saus", currentStock: 8, minimumStock: 15, unit: "Botol", costPerUnit: 12000 },
  { id: "5", name: "Cabai Rawit", sku: "CBR-001", category: "Bumbu", currentStock: 1, minimumStock: 5, unit: "Kg", costPerUnit: 45000 },
];

export default function OwnerDashboardPage() {
  const [period, setPeriod] = useState<PeriodPreset>("this-month");
  const [isLoading] = useState(false);

  const totalRevenue = mockDailySales.reduce((sum, d) => sum + d.totalRevenue, 0);
  const totalOrders = mockDailySales.reduce((sum, d) => sum + d.totalOrders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalTax = mockDailySales.reduce((sum, d) => sum + d.totalTax, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
            Ringkasan bisnis restoran Anda
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Metric Cards */}
      <BentoGrid cols={4}>
        <MetricCard
          icon={<DollarSign size={24} />}
          label="Gross Profit"
          value={formatCurrency(totalRevenue)}
          subtitle="Pendapatan kotor bulan ini"
          trend={{ value: 12.5, isPositive: true }}
          variant="success"
        />
        <MetricCard
          icon={<TrendingDown size={24} />}
          label="Opex"
          value={formatCurrency(12500000)}
          subtitle="Total biaya operasional"
          trend={{ value: 3.2, isPositive: false }}
          variant="warning"
        />
        <MetricCard
          icon={<ShoppingCart size={24} />}
          label="Total Pesanan"
          value={String(totalOrders)}
          subtitle="Bulan ini"
          trend={{ value: 8.1, isPositive: true }}
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
          <SalesChart data={mockDailySales} isLoading={isLoading} period="month" />
        </BentoItem>

        <BentoItem colSpan={1}>
          <CardHeader>
            <CardTitle>Item Terlaris</CardTitle>
            <Badge variant="brand">{mockTopItems.length} item</Badge>
          </CardHeader>
          <TopItemsChart items={mockTopItems} isLoading={isLoading} />
        </BentoItem>
      </BentoGrid>

      {/* Bottom Row */}
      <BentoGrid cols={2}>
        <BentoItem colSpan={1}>
          <CardHeader>
            <CardTitle>Stok Menipis</CardTitle>
            <Badge variant="danger">{mockLowStock.length} item</Badge>
          </CardHeader>
          <LowStockCard items={mockLowStock} isLoading={isLoading} />
        </BentoItem>

        <BentoItem colSpan={1}>
          <CardHeader>
            <CardTitle>Aktivitas Terkini</CardTitle>
            <Badge variant="info">Live</Badge>
          </CardHeader>
          <div className="space-y-4">
            {[
              { action: "Pesanan #1024", detail: "Rp 185.000 - Lunas", time: "2 menit lalu", type: "success" },
              { action: "Pesanan #1023", detail: "Rp 92.000 - Lunas", time: "5 menit lalu", type: "success" },
              { action: "Stok Opname", detail: "Minyak Goreng berkurang", time: "10 menit lalu", type: "warning" },
              { action: "Shift Tutup", detail: "Kasir: Siti - Shift Pagi", time: "1 jam lalu", type: "info" },
              { action: "Pesanan #1018", detail: "Rp 250.000 - Dibatalkan", time: "2 jam lalu", type: "danger" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  activity.type === "success" ? "bg-green-500" :
                  activity.type === "warning" ? "bg-yellow-500" :
                  activity.type === "danger" ? "bg-red-500" : "bg-blue-500"
                }`} />
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
            ))}
          </div>
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
