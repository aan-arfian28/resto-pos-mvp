"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { menuService } from "@/services/menuService";
import type { Category } from "@/types/menu";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    setLoading(true);
    try { const data = await menuService.getCategories(); setCategories(data || []); } catch { setCategories([]); }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Kategori</h1>
        <Button onClick={() => { setEditing(null); setShowModal(true); }} leftIcon={<Plus size={18} />}>Tambah</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-dark-400">Belum ada kategori.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.id} className="bento-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderTree size={20} className="text-brand-600" />
                <div>
                  <p className="font-medium">{cat.name}</p>
                  {cat.children?.length > 0 && <p className="text-xs text-gray-500">{cat.children.length} subkategori</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(cat); setShowModal(true); }} className="p-1.5 rounded hover:bg-gray-100"><Edit size={15} /></button>
                <button onClick={async () => { await menuService.deleteCategory(cat.id); loadCategories(); }} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Kategori" : "Tambah Kategori"}>
        <CategoryForm item={editing} categories={categories} onSave={() => { setShowModal(false); loadCategories(); }} />
      </Modal>
    </div>
  );
}

function CategoryForm({ item, categories, onSave }: { item: Category | null; categories: Category[]; onSave: () => void }) {
  const [name, setName] = useState(item?.name || "");
  const [parentId, setParentId] = useState(item?.parent_id || "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const data: any = { name };
    if (parentId) data.parent_id = parentId;
    if (item) await menuService.updateCategory(item.id, data);
    else await menuService.createCategory(data);
    setSaving(false);
    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nama Kategori" value={name} onChange={e => setName(e.target.value)} required />
      <div className="space-y-1">
        <label className="text-sm font-medium">Induk Kategori</label>
        <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full rounded-lg border p-2 text-sm">
          <option value="">Tidak ada (root)</option>
          {categories.filter(c => c.id !== item?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <Button type="submit" fullWidth isLoading={saving}>{item ? "Simpan" : "Tambah"}</Button>
    </form>
  );
}
