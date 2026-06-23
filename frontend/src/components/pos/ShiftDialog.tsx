"use client";

import React, { useState } from "react";
import { LogIn, LogOut, DollarSign, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/formatCurrency";
import { calculateTax } from "@/lib/taxCalculator";

interface OpenShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (openingBalance: number, notes?: string) => void;
  isLoading?: boolean;
}

export function OpenShiftDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: OpenShiftDialogProps) {
  const [balance, setBalance] = useState("0");
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    const amount = parseFloat(balance.replace(/[^0-9]/g, "")) || 0;
    onConfirm(amount, notes || undefined);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buka Shift" size="sm">
      <div className="space-y-4">
        <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-center">
          <LogIn size={32} className="mx-auto text-brand-600 mb-2" />
          <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
            Buka Shift Baru
          </p>
          <p className="text-xs text-brand-600/70 mt-1">
            Masukkan saldo awal untuk memulai shift
          </p>
        </div>

        <Input
          label="Saldo Awal"
          value={balance}
          onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ""))}
          leftIcon={<DollarSign size={18} />}
          placeholder="0"
        />

        <Input
          label="Catatan (opsional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Misal: Shift pagi"
        />

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Batal
          </Button>
          <Button
            fullWidth
            onClick={handleConfirm}
            isLoading={isLoading}
            leftIcon={<LogIn size={18} />}
          >
            Buka Shift
          </Button>
        </div>
      </div>
    </Modal>
  );
}

interface EndShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (closingBalance: number, notes?: string) => void;
  onViewReport?: () => void;
  totalSales: number;
  totalOrders: number;
  openingBalance: number;
  isLoading?: boolean;
}

export function EndShiftDialog({
  isOpen,
  onClose,
  onConfirm,
  onViewReport,
  totalSales,
  totalOrders,
  openingBalance,
  isLoading = false,
}: EndShiftDialogProps) {
  const [closingBalance, setClosingBalance] = useState(
    String(totalSales + openingBalance)
  );
  const [notes, setNotes] = useState("");

  const expectedBalance = totalSales + openingBalance;
  const actualBalance = parseFloat(closingBalance.replace(/[^0-9]/g, "")) || 0;
  const difference = actualBalance - expectedBalance;

  const handleConfirm = () => {
    const amount = parseFloat(closingBalance.replace(/[^0-9]/g, "")) || 0;
    onConfirm(amount, notes || undefined);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tutup Shift" size="md">
      <div className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-dark-400">Total Penjualan</p>
            <p className="text-lg font-bold text-gray-900 dark:text-dark-50">
              {formatCurrency(totalSales)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-dark-400">Total Pesanan</p>
            <p className="text-lg font-bold text-gray-900 dark:text-dark-50">
              {totalOrders}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-dark-400">Saldo Awal</p>
            <p className="text-lg font-bold text-gray-900 dark:text-dark-50">
              {formatCurrency(openingBalance)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-dark-700 rounded-lg text-center">
            <p className="text-xs text-gray-500 dark:text-dark-400">Saldo Diharapkan</p>
            <p className="text-lg font-bold text-gray-900 dark:text-dark-50">
              {formatCurrency(expectedBalance)}
            </p>
          </div>
        </div>

        <Input
          label="Saldo Akhir"
          value={closingBalance}
          onChange={(e) => setClosingBalance(e.target.value.replace(/[^0-9]/g, ""))}
          leftIcon={<DollarSign size={18} />}
        />

        {difference !== 0 && (
          <div
            className={`p-3 rounded-lg text-sm ${
              difference >= 0
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
            }`}
          >
            Selisih: {formatCurrency(Math.abs(difference))} ({difference >= 0 ? "Lebih" : "Kurang"})
          </div>
        )}

        <Input
          label="Catatan (opsional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan shift"
        />

        <div className="flex gap-2 pt-2">
          {onViewReport && (
            <Button
              variant="outline"
              onClick={onViewReport}
              leftIcon={<FileText size={18} />}
            >
              Z-Report
            </Button>
          )}
          <Button variant="secondary" fullWidth onClick={onClose}>
            Batal
          </Button>
          <Button
            fullWidth
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            leftIcon={<LogOut size={18} />}
          >
            Tutup Shift
          </Button>
        </div>
      </div>
    </Modal>
  );
}
