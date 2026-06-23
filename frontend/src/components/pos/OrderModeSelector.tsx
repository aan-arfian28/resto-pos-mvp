"use client";

import React from "react";
import { UtensilsCrossed, ShoppingBag, Bike } from "lucide-react";
import { usePosStore } from "@/stores/posStore";
import type { OrderMode } from "@/types";

const modes: { value: OrderMode; label: string; icon: React.ReactNode }[] = [
  { value: "dine-in", label: "Makan Di Sini", icon: <UtensilsCrossed size={18} /> },
  { value: "takeaway", label: "Bungkus", icon: <ShoppingBag size={18} /> },
  { value: "delivery", label: "Antar", icon: <Bike size={18} /> },
];

export function OrderModeSelector() {
  const { orderMode, setOrderMode, tableNumber, setTableNumber, customerName, setCustomerName } =
    usePosStore();

  return (
    <div className="space-y-3">
      {/* Mode Tabs */}
      <div className="flex gap-1.5">
        {modes.map((mode) => (
          <button
            key={mode.value}
            onClick={() => setOrderMode(mode.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                orderMode === mode.value
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600"
              }
            `}
          >
            {mode.icon}
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Dine-in: Table Number */}
      {orderMode === "dine-in" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="No. Meja"
            className="w-24 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      )}

      {/* Delivery: Customer Name */}
      {orderMode === "delivery" && (
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nama Pelanggan"
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      )}
    </div>
  );
}
