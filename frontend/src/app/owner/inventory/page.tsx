"use client";

import React, { useEffect, useState } from "react";
import { Plus, Package, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/services/api";

interface RawMaterial { id: string; name: string; unit: string; current_stock: number; minimum_stock: number; }

export default function InventoryPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showIn, setShowIn] = useState(false);
  const [showOut, setShowOut] = useState(false);
  const [selected, setSelected] = useState<RawMaterial | null>(null);

  useEffect(() => { loadMaterials(); }, []);

  async function loadMaterials() {
    setLoading(true);
    try { const data = await api.get<RawMaterial[]>("/inventory/raw-materials"); setMaterials(data || []); } catch { setMaterials([]); }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Inventory Bahan Baku</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAdd(true)} leftIcon={<Plus size={18} />}>Bahan Baru</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : materials.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-dark-400">Belum ada bahan baku.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nama</TableHead><TableHead>Satuan</TableHead><TableHead>Stok</TableHead><TableHead>Min. Stok</TableHead><TableHead>Status</TableHead><TableHead className="w-32">Aksi</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {materials.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.unit}</TableCell>
                <TableCell>{m.current_stock}</TableCell>
                <TableCell>{m.minimum_stock}</TableCell>
                <TableCell><Badge variant={m.current_stock <= m.minimum_stock ? "danger" : "success"}>{m.current_stock <= m.minimum_stock ? "Menipis" : "Normal"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <button onClick={() => { setSelected(m); setShowIn(true); }} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Barang Masuk"><ArrowDown size={16} /></button>
                    <button onClick={() => { setSelected(m); setShowOut(true); }} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Barang Keluar"><ArrowUp size={16} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Tambah Bahan Baku">
        <AddMaterialForm onSave={() => { setShowAdd(false); loadMaterials(); }} />
      </Modal>
      <Modal isOpen={showIn} onClose={() => setShowIn(false)} title={`Barang Masuk: ${selected?.name || ""}`}>
        <StockInForm material={selected} onSave={() => { setShowIn(false); loadMaterials(); }} />
      </Modal>
      <Modal isOpen={showOut} onClose={() => setShowOut(false)} title={`Barang Keluar: ${selected?.name || ""}`}>
        <StockOutForm material={selected} onSave={() => { setShowOut(false); loadMaterials(); }} />
      </Modal>
    </div>
  );
}

function AddMaterialForm({ onSave }: { onSave: () => void }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [stock, setStock] = useState("0");
  const [minStock, setMinStock] = useState("0");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.post("/inventory/raw-materials", { name, unit, current_stock: parseFloat(stock), minimum_stock: parseFloat(minStock) });
    setSaving(false);
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nama Bahan" value={name} onChange={e => setName(e.target.value)} required />
      <div>
        <label className="text-sm font-medium">Satuan</label>
        <select value={unit} onChange={e => setUnit(e.target.value)} className="w-full rounded-lg border p-2 text-sm mt-1">
          {["kg", "liter", "butir", "gram", "ml", "pcs", "pack"].map(u => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <Input label="Stok Awal" type="number" value={stock} onChange={e => setStock(e.target.value)} />
      <Input label="Ambang Minimum" type="number" value={minStock} onChange={e => setMinStock(e.target.value)} />
      <Button type="submit" fullWidth isLoading={saving}>Simpan</Button>
    </form>
  );
}

function StockInForm({ material, onSave }: { material: RawMaterial | null; onSave: () => void }) {
  const [qty, setQty] = useState("");
  const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.post("/inventory/stock-in", { raw_material_id: material?.id, quantity: parseFloat(qty) });
    setSaving(false); onSave();
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Jumlah Masuk" type="number" value={qty} onChange={e => setQty(e.target.value)} required />
      <Button type="submit" fullWidth isLoading={saving}>Catat Barang Masuk</Button>
    </form>
  );
}

function StockOutForm({ material, onSave }: { material: RawMaterial | null; onSave: () => void }) {
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("Pemakaian Harian");
  const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.post("/inventory/stock-out", { raw_material_id: material?.id, quantity: parseFloat(qty), reason });
    setSaving(false); onSave();
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Jumlah Keluar" type="number" value={qty} onChange={e => setQty(e.target.value)} required />
      <Input label="Alasan" value={reason} onChange={e => setReason(e.target.value)} />
      <Button type="submit" fullWidth isLoading={saving}>Catat Barang Keluar</Button>
    </form>
  );
}
