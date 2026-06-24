"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { Search } from "lucide-react";
import { api } from "@/services/api";

interface LogEntry { id: string; user_id: string; action_type: string; description: string; created_at: string; user?: { username: string; full_name: string }; }

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const resp = await api.get<LogEntry[]>(`/activity-log?limit=100`);
      setLogs(resp || []);
    } catch { setLogs([]); }
    setLoading(false);
  }

  const filtered = filter
    ? logs.filter(l => l.action_type.toLowerCase().includes(filter.toLowerCase()) || l.description?.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-50">Activity Log</h1>

      <div className="w-72">
        <Input placeholder="Filter aktivitas..." value={filter} onChange={e => setFilter(e.target.value)} leftIcon={<Search size={18} />} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-dark-400">Belum ada aktivitas tercatat.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow><TableHead>Waktu</TableHead><TableHead>User</TableHead><TableHead>Aksi</TableHead><TableHead>Deskripsi</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(l => (
              <TableRow key={l.id}>
                <TableCell className="text-xs whitespace-nowrap">{new Date(l.created_at).toLocaleString("id-ID")}</TableCell>
                <TableCell>{l.user?.username || l.user_id}</TableCell>
                <TableCell><Badge variant="info">{l.action_type}</Badge></TableCell>
                <TableCell className="text-sm text-gray-600 dark:text-dark-400">{l.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
