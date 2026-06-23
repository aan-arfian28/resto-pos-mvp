"use client";

import React from "react";
import { AlertTriangle, Package } from "lucide-react";
import type { InventoryItem } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/Badge";

interface LowStockCardProps {
  items: InventoryItem[];
  isLoading?: boolean;
}

export function LowStockCard({ items, isLoading = false }: LowStockCardProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-dark-700 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-3/4 animate-pulse" />
              <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-dark-500">
        <Package size={32} className="mb-2 opacity-50" />
        <p className="text-sm font-medium">Stok aman</p>
        <p className="text-xs mt-1">Tidak ada item dengan stok menipis</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const stockPercent = (item.currentStock / item.minimumStock) * 100;
        const isCritical = stockPercent <= 50;

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
          >
            <div
              className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                isCritical
                  ? "bg-red-100 dark:bg-red-900/20"
                  : "bg-yellow-100 dark:bg-yellow-900/20"
              }`}
            >
              <AlertTriangle
                size={20}
                className={
                  isCritical
                    ? "text-red-500"
                    : "text-yellow-500"
                }
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-dark-50 truncate">
                {item.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={isCritical ? "danger" : "warning"} size="sm">
                  {item.currentStock} {item.unit}
                </Badge>
                <span className="text-xs text-gray-500 dark:text-dark-400">
                  Min: {item.minimumStock}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-dark-400 shrink-0">
              <p>{formatCurrency(item.costPerUnit)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
