"use client";

import React from "react";
import { UtensilsCrossed, ShoppingBag, Bike } from "lucide-react";
import { usePosStore } from "@/stores/posStore";
import type { OrderType } from "@/types";

const modes: { value: OrderType; label: string; icon: React.ReactNode }[] = [
  { value: "dine_in", label: "Makan Di Sini", icon: <UtensilsCrossed size={16} /> },
  { value: "takeaway", label: "Bungkus", icon: <ShoppingBag size={16} /> },
  { value: "delivery", label: "Antar", icon: <Bike size={16} /> },
];

export function OrderModeSelector() {
  const { orderMode, setOrderMode } = usePosStore();

  return (
    <div className="flex bg-gray-100 dark:bg-dark-700 rounded-lg p-0.5">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => setOrderMode(mode.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            orderMode === mode.value
              ? "bg-white dark:bg-dark-800 text-brand-700 dark:text-brand-400 shadow-sm"
              : "text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200"
          }`}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
