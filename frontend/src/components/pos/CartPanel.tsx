"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { usePosStore } from "@/stores/posStore";
import { CartItem } from "./CartItem";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface CartPanelProps {
  onPay: () => void;
  onHold: () => void;
}

export function CartPanel({ onPay, onHold }: CartPanelProps) {
  const {
    items,
    subtotal,
    taxAmount,
    serviceCharge,
    grandTotal,
    itemCount,
    updateQuantity,
    voidItem,
    updateItemNotes,
    clearCart,
  } = useCartStore();

  const { heldBills, setActiveView } = usePosStore();

  const activeItems = items.filter((i) => !i.isVoided);
  const hasItems = activeItems.length > 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-800 border-l border-gray-200 dark:border-dark-700">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-brand-600" />
            <h2 className="font-semibold text-gray-900 dark:text-dark-50">Pesanan</h2>
            {itemCount > 0 && (
              <Badge variant="brand" size="sm">{itemCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {heldBills.length > 0 && (
              <button
                onClick={() => setActiveView("hold")}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Tagihan ({heldBills.length})
              </button>
            )}
            {hasItems && (
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-dark-500">
            <ShoppingCart size={48} className="mb-3 opacity-50" />
            <p className="text-sm">Belum ada item</p>
            <p className="text-xs mt-1">Pilih menu untuk memulai pesanan</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onVoid={voidItem}
              onUpdateNotes={updateItemNotes}
            />
          ))
        )}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 dark:border-dark-700 p-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500 dark:text-dark-400">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {serviceCharge > 0 && (
          <div className="flex justify-between text-sm text-gray-500 dark:text-dark-400">
            <span>Service Charge (5%)</span>
            <span>{formatCurrency(serviceCharge)}</span>
          </div>
        )}
        {taxAmount > 0 && (
          <div className="flex justify-between text-sm text-gray-500 dark:text-dark-400">
            <span>PPN 11%</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-dark-50 pt-2 border-t border-gray-200 dark:border-dark-700">
          <span>Total</span>
          <span className="text-brand-600">{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 pt-0 space-y-2">
        <Button
          fullWidth
          size="xl"
          onClick={onPay}
          disabled={!hasItems}
          className="text-base"
        >
          Bayar - {formatCurrency(grandTotal)}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={onHold}
            disabled={!hasItems}
          >
            Hold Bill
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={clearCart}
            disabled={!hasItems}
          >
            Baru
          </Button>
        </div>
      </div>
    </div>
  );
}
