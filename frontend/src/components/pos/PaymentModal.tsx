"use client";

import React, { useState } from "react";
import { Banknote, Smartphone, CreditCard, Wallet } from "lucide-react";
import type { PaymentMethod } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChangeCalculator } from "./ChangeCalculator";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (method: PaymentMethod, amount: number, change: number) => void;
  total?: number;
}

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "cash", label: "Tunai", icon: <Banknote size={24} /> },
  { value: "qris", label: "QRIS", icon: <Smartphone size={24} /> },
  { value: "debit", label: "Debit", icon: <CreditCard size={24} /> },
  { value: "gopay", label: "GoPay", icon: <Wallet size={24} /> },
  { value: "ovo", label: "OVO", icon: <Smartphone size={24} /> },
];

export function PaymentModal({ isOpen, onClose, onPaymentComplete, total }: PaymentModalProps) {
  const { grandTotal: storeGrandTotal, subtotal } = useCartStore();
  const grandTotal = total ?? storeGrandTotal;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cashAmount, setCashAmount] = useState<string>(String(grandTotal));
  const [error, setError] = useState<string | null>(null);

  const change = selectedMethod === "cash"
    ? Math.max(0, parseFloat(cashAmount.replace(/[^0-9]/g, "")) - grandTotal)
    : 0;

  const handlePayment = () => {
    if (!selectedMethod) {
      setError("Pilih metode pembayaran");
      return;
    }

    if (selectedMethod === "cash") {
      const parsed = parseFloat(cashAmount.replace(/[^0-9]/g, ""));
      if (isNaN(parsed) || parsed < grandTotal) {
        setError("Jumlah pembayaran kurang");
        return;
      }
      onPaymentComplete(selectedMethod, parsed, parsed - grandTotal);
    } else {
      onPaymentComplete(selectedMethod, grandTotal, 0);
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setCashAmount(String(grandTotal));
    setError(null);
    onClose();
  };

  const quickAmounts = [
    grandTotal,
    Math.ceil(grandTotal / 1000) * 1000,
    Math.ceil(grandTotal / 5000) * 5000,
    Math.ceil(grandTotal / 10000) * 10000,
    Math.ceil(grandTotal / 50000) * 50000,
    Math.ceil(grandTotal / 100000) * 100000,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= grandTotal);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pembayaran"
      size="lg"
    >
      <div className="space-y-6">
        {/* Total Display */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-dark-400 mb-1">Total Pembayaran</p>
          <p className="text-3xl font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(grandTotal)}
          </p>
        </div>

        {/* Payment Methods */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-3">
            Metode Pembayaran
          </p>
          <div className="grid grid-cols-5 gap-2">
            {paymentMethods.map((method) => (
              <button
                key={method.value}
                onClick={() => {
                  setSelectedMethod(method.value);
                  setError(null);
                }}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                  ${selectedMethod === method.value
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                    : "border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 text-gray-600 dark:text-dark-300"
                  }
                `}
              >
                {method.icon}
                <span className="text-xs font-medium">{method.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash Input */}
        {selectedMethod === "cash" && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200">
              Jumlah Tunai
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">
                Rp
              </span>
              <input
                type="text"
                value={cashAmount}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, "");
                  setCashAmount(cleaned);
                  setError(null);
                }}
                className="w-full pl-12 pr-4 py-3 text-2xl font-bold rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500 text-right"
                autoFocus
              />
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.slice(0, 4).map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setCashAmount(String(amount));
                    setError(null);
                  }}
                  className="px-3 py-1.5 text-sm bg-white dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 transition-colors"
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Change Display */}
        {selectedMethod === "cash" && change > 0 && (
          <ChangeCalculator change={change} />
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth size="lg" onClick={handleClose}>
            Batal
          </Button>
          <Button
            fullWidth
            size="lg"
            onClick={handlePayment}
            disabled={!selectedMethod}
          >
            Bayar {selectedMethod === "cash" && cashAmount
              ? formatCurrency(parseFloat(cashAmount.replace(/[^0-9]/g, "")) || 0)
              : formatCurrency(grandTotal)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
