"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/services/api";

interface StockTx { id: string; type: string; quantity: number; reason: string; created_at: string; raw_material?: { name: string; unit: string }; user?: { username: string }; }

export default function InventoryHistoryPage() {
  const [txs, setTxs] = useState<StockTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    setLoading(true);
    try { const data = await api.get<StockTx[]>("/inventory/history?limit=100"); setTxs(data || []); } catch { setTxs([]); }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Riwayat Perubahan Stok</h1>
      {loading ? <div className="flex justify-center py-12"><Spinner size="lg" /></div> : txs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Belum ada riwayat.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Waktu</TableHead><TableHead>Bahan</TableHead><TableHead>Tipe</TableHead><TableHead>Jumlah</TableHead><TableHead>Alasan</TableHead><TableHead>User</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {txs.map(tx => (
              <TableRow key={tx.id}>
                <TableCell className="text-xs whitespace-nowrap">{new Date(tx.created_at).toLocaleString("id-ID")}</TableCell>
                <TableCell>{tx.raw_material?.name || "-"}</TableCell>
                <TableCell><Badge variant={tx.type === "in" ? "success" : tx.type === "out" ? "danger" : "warning"}>{tx.type === "in" ? "Masuk" : tx.type === "out" ? "Keluar" : "Adjustment"}</Badge></TableCell>
                <TableCell>{tx.quantity}</TableCell>
                <TableCell className="text-sm text-gray-500">{tx.reason || "-"}</TableCell>
                <TableCell>{tx.user?.username || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
