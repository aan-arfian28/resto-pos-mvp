"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/services/api";
import { formatCurrency } from "@/lib/formatCurrency";

interface Opex { id: string; description: string; amount: number; category: string; date: string; }

export default function OpexPage() {
  const [items, setItems] = useState<Opex[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadItems(); }, []);

  async function loadItems() {
    setLoading(true);
    try { const data = await api.get<Opex[]>("/opex"); setItems(data || []); } catch { setItems([]); }
    setLoading(false);
  }

  const total = items.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Pengeluaran Operasional</h1>
          <p className="text-sm text-gray-500">Total: <strong>{formatCurrency(total)}</strong></p>
        </div>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={18} />}>Tambah Opex</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-dark-400">Belum ada pengeluaran.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Tanggal</TableHead><TableHead>Deskripsi</TableHead><TableHead>Kategori</TableHead><TableHead>Jumlah</TableHead><TableHead className="w-16" /></TableRow>
          </TableHeader>
          <TableBody>
            {items.map(i => (
              <TableRow key={i.id}>
                <TableCell>{i.date}</TableCell>
                <TableCell className="font-medium">{i.description}</TableCell>
                <TableCell>{i.category || "-"}</TableCell>
                <TableCell>{formatCurrency(i.amount)}</TableCell>
                <TableCell>
                  <button onClick={async () => { await api.delete(`/opex/${i.id}`); loadItems(); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Opex">
        <OpexForm onSave={() => { setShowModal(false); loadItems(); }} />
      </Modal>
    </div>
  );
}

function OpexForm({ onSave }: { onSave: () => void }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.post("/opex", { description: desc, amount: parseFloat(amount), category, date });
    setSaving(false); onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Deskripsi" value={desc} onChange={e => setDesc(e.target.value)} required />
      <Input label="Jumlah" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
      <Input label="Kategori" value={category} onChange={e => setCategory(e.target.value)} placeholder="Listrik, Gaji, dll" />
      <Input label="Tanggal" type="date" value={date} onChange={e => setDate(e.target.value)} required />
      <Button type="submit" fullWidth isLoading={saving}>Simpan</Button>
    </form>
  );
}
