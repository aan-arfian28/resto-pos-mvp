"use client";

import React, { useEffect, useState } from "react";
import { Plus, Edit, Ban } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/services/api";
import type { User } from "@/types/user";

export default function EmployeesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try { const data = await api.get<User[]>("/employees"); setUsers(data || []); } catch { setUsers([]); }
    setLoading(false);
  }

  async function toggleUser(id: string, active: boolean) {
    await api.put(`/employees/${id}`, { is_active: !active });
    loadUsers();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Karyawan</h1>
        <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={18} />}>Tambah</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nama</TableHead><TableHead>Username</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="w-24">Aksi</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell><Badge variant={u.role === "owner" ? "warning" : "info"}>{u.role}</Badge></TableCell>
                <TableCell><Badge variant={u.is_active !== false ? "success" : "danger"}>{u.is_active !== false ? "Aktif" : "Nonaktif"}</Badge></TableCell>
                <TableCell>
                  <button onClick={() => toggleUser(u.id, u.is_active !== false)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title={u.is_active !== false ? "Nonaktifkan" : "Aktifkan"}>
                    <Ban size={16} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Karyawan">
        <EmployeeForm onSave={() => { setShowModal(false); loadUsers(); }} />
      </Modal>
    </div>
  );
}

function EmployeeForm({ onSave }: { onSave: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"cashier" | "owner">("cashier");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Password tidak cocok"); return; }
    setSaving(true);
    try {
      await api.post("/employees", { username, password, confirm_password: confirm, full_name: fullName, role });
      onSave();
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Input label="Username" value={username} onChange={e => setUsername(e.target.value)} required />
      <Input label="Nama Lengkap" value={fullName} onChange={e => setFullName(e.target.value)} required />
      <div>
        <label className="text-sm font-medium">Role</label>
        <select value={role} onChange={e => setRole(e.target.value as any)} className="w-full rounded-lg border p-2 text-sm mt-1">
          <option value="cashier">Cashier</option>
          <option value="owner">Owner</option>
        </select>
      </div>
      <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      <Input label="Konfirmasi Password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
      <Button type="submit" fullWidth isLoading={saving}>Tambah</Button>
    </form>
  );
}
