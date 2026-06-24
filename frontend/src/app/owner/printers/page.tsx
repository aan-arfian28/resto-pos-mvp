"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/services/api";

interface PrinterItem { id: string; name: string; type: string; ip_address: string; port: number; active: boolean; }

export default function PrintersPage() {
  const [printers, setPrinters] = useState<PrinterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadPrinters(); }, []);

  async function loadPrinters() {
    setLoading(true);
    try { const data = await api.get<PrinterItem[]>("/printers"); setPrinters(data || []); } catch { setPrinters([]); }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Printer</h1>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={18} />}>Tambah Printer</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : printers.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-dark-400">Belum ada printer terdaftar.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {printers.map(p => (
            <div key={p.id} className="bento-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Printer size={24} className="text-brand-600" />
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.ip_address}:{p.port} — <Badge variant={p.active ? "success" : "danger"}>{p.active ? "Aktif" : "Nonaktif"}</Badge></p>
                  <p className="text-xs text-gray-400 capitalize">{p.type}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={async () => { await api.delete(`/printers/${p.id}`); loadPrinters(); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Printer">
        <PrinterForm onSave={() => { setShowModal(false); loadPrinters(); }} />
      </Modal>
    </div>
  );
}

function PrinterForm({ onSave }: { onSave: () => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"kitchen" | "receipt">("kitchen");
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("9100");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.post("/printers", { name, type, ip_address: ip, port: parseInt(port) });
    setSaving(false); onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nama Printer" value={name} onChange={e => setName(e.target.value)} required />
      <div>
        <label className="text-sm font-medium">Tipe</label>
        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full rounded-lg border p-2 text-sm mt-1">
          <option value="kitchen">Dapur (Kitchen)</option>
          <option value="receipt">Struk (Receipt)</option>
        </select>
      </div>
      <Input label="IP Address" value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.x" required />
      <Input label="Port" type="number" value={port} onChange={e => setPort(e.target.value)} />
      <Button type="submit" fullWidth isLoading={saving}>Simpan</Button>
    </form>
  );
}
