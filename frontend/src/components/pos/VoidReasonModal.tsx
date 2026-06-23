"use client";

import React from "react";
import type { VoidReason } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface VoidReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: VoidReason) => void;
  itemName: string;
}

const reasons: { value: VoidReason; description: string }[] = [
  {
    value: "Salah Input",
    description: "Item tidak sengaja ditambahkan",
  },
  {
    value: "Pelanggan Batal",
    description: "Pelanggan membatalkan pesanan",
  },
];

export function VoidReasonModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: VoidReasonModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Void Item"
      size="sm"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-dark-300">
          Alasan void untuk <strong>{itemName}</strong>:
        </p>

        <div className="space-y-2">
          {reasons.map((reason) => (
            <button
              key={reason.value}
              onClick={() => onConfirm(reason.value)}
              className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-dark-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-dark-50 group-hover:text-red-600 dark:group-hover:text-red-400">
                {reason.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
                {reason.description}
              </p>
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Batal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
