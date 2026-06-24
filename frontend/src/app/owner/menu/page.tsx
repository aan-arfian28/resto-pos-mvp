"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { menuService } from "@/services/menuService";
import type { MenuItem } from "@/types/menu";
import { formatCurrency } from "@/lib/formatCurrency";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await menuService.getMenuItems();
      setItems(data || []);
    } catch { setItems([]); }
    setLoading(false);
  }

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Menu</h1>
        <Button onClick={() => { setEditing(null); setShowModal(true); }} leftIcon={<Plus size={18} />}>
          Tambah Item
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="w-72">
          <Input placeholder="Cari menu..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search size={18} />} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-dark-400">Belum ada item menu.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Markup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(item => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category?.name || "-"}</TableCell>
                <TableCell>{formatCurrency(item.base_price)}</TableCell>
                <TableCell>{item.delivery_markup_percent}%</TableCell>
                <TableCell><Badge variant={item.is_available ? "success" : "danger"}>{item.is_available ? "Tersedia" : "Sold Out"}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-dark-700"><Edit size={16} /></button>
                    <button onClick={async () => { await menuService.deleteMenuItem(item.id); loadItems(); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Item" : "Tambah Item"}>
        <MenuItemForm item={editing} onSave={async () => { setShowModal(false); loadItems(); }} />
      </Modal>
    </div>
  );
}

function MenuItemForm({ item, onSave }: { item: MenuItem | null; onSave: () => void }) {
  const [name, setName] = useState(item?.name || "");
  const [basePrice, setBasePrice] = useState(item?.base_price?.toString() || "");
  const [markup, setMarkup] = useState(item?.delivery_markup_percent?.toString() || "0");
  const [desc, setDesc] = useState(item?.description || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data = { name, base_price: parseFloat(basePrice), delivery_markup_percent: parseFloat(markup), description: desc };
    if (item) await menuService.updateMenuItem(item.id, data);
    else await menuService.createMenuItem(data);
    setSaving(false);
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nama Menu" value={name} onChange={e => setName(e.target.value)} required />
      <Input label="Harga Dasar" type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} required />
      <Input label="Markup Delivery (%)" type="number" value={markup} onChange={e => setMarkup(e.target.value)} />
      <Input label="Deskripsi" value={desc} onChange={e => setDesc(e.target.value)} />
      <Button type="submit" fullWidth isLoading={saving}>{item ? "Simpan" : "Tambah"}</Button>
    </form>
  );
}
