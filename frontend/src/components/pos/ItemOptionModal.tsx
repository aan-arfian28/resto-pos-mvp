"use client";

import React, { useState } from "react";
import { Flame } from "lucide-react";
import type { MenuItem, SpiceLevel } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";

interface ItemOptionModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: (options: { spiceLevel: SpiceLevel; notes: string }) => void;
}

const spiceLabels: Record<number, string> = {
  0: "Tidak Pedas",
  1: "Level 1",
  2: "Level 2",
  3: "Level 3",
};

export function ItemOptionModal({
  isOpen,
  item,
  onClose,
  onConfirm,
}: ItemOptionModalProps) {
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(0);
  const [notes, setNotes] = useState("");

  if (!item) return null;

  const handleConfirm = () => {
    onConfirm({ spiceLevel, notes });
    setSpiceLevel(0);
    setNotes("");
  };

  const handleClose = () => {
    setSpiceLevel(0);
    setNotes("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={item.name}
      size="sm"
    >
      <div className="space-y-5">
        {/* Price */}
        <div className="text-center">
          <p className="text-2xl font-bold text-brand-600">{formatCurrency(item.price)}</p>
        </div>

        {/* Spice Level */}
        {item.spiceLevel !== undefined && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={16} className="text-orange-500" />
              <p className="text-sm font-medium text-gray-700 dark:text-dark-200">
                Level Pedas
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => setSpiceLevel(level as SpiceLevel)}
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${spiceLevel === level
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600"
                    }
                  `}
                >
                  {level === 0 ? "No" : level}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
              {spiceLabels[spiceLevel]}
            </p>
          </div>
        )}

        {/* Notes */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
            Catatan
          </p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan catatan..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" fullWidth onClick={handleClose}>
            Batal
          </Button>
          <Button fullWidth onClick={handleConfirm}>
            Tambah ke Pesanan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
