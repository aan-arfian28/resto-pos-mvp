"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/services/api";

export default function SettingsPage() {
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState("11");
  const [tokenEnabled, setTokenEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const data = await api.get<any>("/settings");
      if (data) {
        setTaxEnabled(data.tax_enabled === "true");
        setTaxRate(data.tax_rate || "11");
        setTokenEnabled(data.token_enabled === "true");
      }
    } catch {
      // Use defaults
    }
    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    await api.put("/settings", {
      tax_enabled: taxEnabled,
      tax_rate: parseFloat(taxRate),
      token_enabled: tokenEnabled,
    });
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Pengaturan Sistem</h1>

      <div className="bento-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Aktifkan PPN</p>
            <p className="text-sm text-gray-500">Tambahkan pajak PPN pada setiap transaksi</p>
          </div>
          <Switch checked={taxEnabled} onChange={setTaxEnabled} />
        </div>

        {taxEnabled && (
          <div className="pl-4 border-l-2 border-brand-200 dark:border-brand-800">
            <Input
              label="Persentase PPN (%)"
              type="number"
              value={taxRate}
              onChange={e => setTaxRate(e.target.value)}
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        )}

        <hr className="dark:border-dark-700" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Aktifkan Input Nomor Meja/Token</p>
            <p className="text-sm text-gray-500">Tampilkan field nomor meja di POS Kasir</p>
          </div>
          <Switch checked={tokenEnabled} onChange={setTokenEnabled} />
        </div>
      </div>

      <Button onClick={saveSettings} isLoading={saving}>Simpan Pengaturan</Button>
    </div>
  );
}
