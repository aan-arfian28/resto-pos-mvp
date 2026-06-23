"use client";

import React from "react";
import { Clock, ArrowRight } from "lucide-react";
import { usePosStore } from "@/stores/posStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface BillHoldListProps {
  onResume: (billId: string) => void;
}

export function BillHoldList({ onResume }: BillHoldListProps) {
  const { heldBills, setActiveView } = usePosStore();

  if (heldBills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-dark-500">
        <Clock size={48} className="mb-3 opacity-50" />
        <p className="text-sm font-medium">Tidak ada tagihan yang ditahan</p>
        <p className="text-xs mt-1">Tagihan yang ditahan akan muncul di sini</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => setActiveView("menu")}
        >
          Kembali ke Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} className="text-brand-600" />
        <h2 className="font-semibold text-gray-900 dark:text-dark-50">
          Tagihan Ditahan
        </h2>
        <span className="text-xs text-gray-500">({heldBills.length})</span>
      </div>

      <div className="space-y-3">
        {heldBills.map((bill) => (
          <div
            key={bill.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 hover:shadow-sm transition-shadow"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900 dark:text-dark-50">
                  {bill.orderNumber}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(bill.heldAt)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-dark-400">
                <span>{bill.itemCount} item</span>
                <span className="font-semibold text-gray-700 dark:text-dark-200">
                  {formatCurrency(bill.total)}
                </span>
              </div>
            </div>
            <button
              onClick={() => onResume(bill.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
            >
              <span>Lanjutkan</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
