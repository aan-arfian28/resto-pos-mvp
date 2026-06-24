"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/services/api";
import { formatCurrency } from "@/lib/formatCurrency";
import { SalesChart } from "@/components/owner/SalesChart";
import { TopItemsChart } from "@/components/owner/TopItemsChart";
import { PeriodSelector, PeriodPreset } from "@/components/owner/PeriodSelector";

interface Summary { total_transactions: number; gross_revenue: number; total_tax: number; total_void: number; total_opex: number; gross_profit: number; }

function dateStr(d: Date) { return d.toISOString().slice(0, 10); }

function getDateRange(preset: PeriodPreset): { from: string; to: string } {
  const now = new Date();
  const today = dateStr(now);
  switch (preset) {
    case "today": return { from: today, to: today };
    case "yesterday": { const y = new Date(now); y.setDate(y.getDate() - 1); const ys = dateStr(y); return { from: ys, to: ys }; }
    case "this-week": { const d = new Date(now); d.setDate(d.getDate() - d.getDay()); return { from: dateStr(d), to: today }; }
    case "this-month": return { from: dateStr(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
    case "last-month": { return { from: dateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: dateStr(new Date(now.getFullYear(), now.getMonth(), 0)) }; }
    default: return { from: today, to: today };
  }
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [dailySales, setDailySales] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<PeriodPreset>("this-month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const updateDates = useCallback((p: PeriodPreset, customFrom?: string, customTo?: string) => {
    if (p === "custom" && customFrom && customTo) {
      setFrom(customFrom); setTo(customTo);
    } else {
      const r = getDateRange(p); setFrom(r.from); setTo(r.to);
    }
  }, []);

  useEffect(() => { updateDates(preset); }, [preset]);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    const qFrom = `${from} 00:00:00`;
    const qTo = `${to} 23:59:59`;
    Promise.all([
      api.get<Summary>(`/reports/summary?from=${qFrom}&to=${qTo}`),
      api.get(`/reports/sales-chart?from=${qFrom}&to=${qTo}`),
      api.get(`/reports/top-items?from=${qFrom}&to=${qTo}`),
    ]).then(([s, ds, ti]) => {
      setSummary(s);
      setDailySales(ds || []);
      setTopItems(ti || []);
    }).catch(() => { setSummary(null); setDailySales([]); setTopItems([]); })
      .finally(() => setLoading(false));
  }, [from, to]);

  const handlePresetChange = (p: PeriodPreset) => { setPreset(p); updateDates(p); };
  const handleDateChange = (start: string, end: string) => { setFrom(start); setTo(end); };

  const exportCSV = () => window.open(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/reports/export/csv?from=${from} 00:00:00&to=${to} 23:59:59`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Laporan</h1>
        <Button variant="secondary" onClick={exportCSV} leftIcon={<Download size={18} />}>CSV</Button>
      </div>

      <PeriodSelector value={preset} onChange={handlePresetChange} startDate={from} endDate={to} onDateChange={handleDateChange} />

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : !summary ? (
        <div className="text-center py-12 text-gray-500">Tidak ada data untuk periode ini.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard label="Total Transaksi" value={summary.total_transactions.toString()} />
            <MetricCard label="Pendapatan Kotor" value={formatCurrency(summary.gross_revenue)} />
            <MetricCard label="PPN" value={formatCurrency(summary.total_tax)} />
            <MetricCard label="Void" value={formatCurrency(summary.total_void)} />
            <MetricCard label="Opex" value={formatCurrency(summary.total_opex)} />
            <MetricCard label="Gross Profit" value={formatCurrency(summary.gross_profit)} highlight />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><h3 className="font-semibold mb-4">Penjualan Harian</h3><SalesChart data={dailySales} /></Card>
            <Card><h3 className="font-semibold mb-4">Top 10 Item</h3><TopItemsChart items={topItems} /></Card>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={highlight ? "bento-card border-green-500 bg-green-50 dark:bg-green-900/20" : "bento-card"}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
