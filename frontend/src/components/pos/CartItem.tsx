"use client";

import React, { useState } from "react";
import { Minus, Plus, X, AlertTriangle } from "lucide-react";
import type { OrderItem, VoidReason } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/Button";
import { VoidReasonModal } from "./VoidReasonModal";

interface CartItemProps {
  item: OrderItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onVoid: (itemId: string, reason: VoidReason) => void;
  onUpdateNotes: (itemId: string, notes: string) => void;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onVoid,
  onUpdateNotes,
}: CartItemProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [notes, setNotes] = useState(item.notes || "");

  if (item.isVoided) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <AlertTriangle size={16} className="text-red-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm line-through text-red-600 dark:text-red-400">
            {item.name}
          </p>
          <p className="text-xs text-red-500 dark:text-red-400">
            Void: {item.voidReason}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start gap-3 p-3 bg-white dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-dark-700 group hover:border-gray-200 dark:hover:border-dark-600 transition-colors">
        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-900 dark:text-dark-50 truncate">
              {item.name}
            </p>
            <button
              onClick={() => setShowVoidModal(true)}
              className="shrink-0 p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Void item"
            >
              <X size={14} />
            </button>
          </div>

          {item.spiceLevel !== undefined && item.spiceLevel > 0 && (
            <p className="text-xs text-orange-500 mt-0.5">
              Level {item.spiceLevel}
            </p>
          )}

          {/* Notes */}
          {showNotes ? (
            <div className="mt-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  onUpdateNotes(item.id, e.target.value);
                }}
                placeholder="Catatan..."
                className="w-full text-xs px-2 py-1 rounded border border-gray-200 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-700 dark:text-dark-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                onBlur={() => setShowNotes(false)}
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mt-1"
            >
              {item.notes || "+ Catatan"}
            </button>
          )}

          <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
            {formatCurrency(item.price)} / pcs
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className="p-1 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            aria-label="Kurangi"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-dark-50">
            {item.quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-1 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            aria-label="Tambah"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Price */}
        <div className="text-right shrink-0 min-w-[80px]">
          <p className="text-sm font-semibold text-gray-900 dark:text-dark-50">
            {formatCurrency(item.subtotal)}
          </p>
        </div>
      </div>

      <VoidReasonModal
        isOpen={showVoidModal}
        onClose={() => setShowVoidModal(false)}
        onConfirm={(reason) => {
          onVoid(item.id, reason);
          setShowVoidModal(false);
        }}
        itemName={item.name}
      />
    </>
  );
}
