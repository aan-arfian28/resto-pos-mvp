"use client";

import React from "react";
import { Plus, ImageOff } from "lucide-react";
import type { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/Badge";

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  const available = item.is_available;

  return (
    <div
      className={`relative group bg-white dark:bg-dark-800 rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md ${
        available
          ? "border-gray-200 dark:border-dark-700 hover:border-brand-300 cursor-pointer"
          : "border-gray-200 dark:border-dark-700 opacity-60 cursor-not-allowed"
      }`}
      onClick={() => available && onAdd(item)}
    >
      {/* Image */}
      <div className="relative h-28 bg-gray-100 dark:bg-dark-700">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-dark-500">
            <ImageOff size={28} />
          </div>
        )}

        {!available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="warning">Habis</Badge>
          </div>
        )}

        {available && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onAdd(item); }} className="p-1.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 shadow-lg">
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 dark:text-dark-50 truncate">{item.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(item.base_price)}
          </span>
        </div>
      </div>
    </div>
  );
}
