"use client";

import React from "react";
import { Plus, Star, ImageOff } from "lucide-react";
import type { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/Badge";

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  return (
    <div
      className={`
        relative group bg-white dark:bg-dark-800 rounded-xl border
        ${item.isAvailable
          ? "border-gray-200 dark:border-dark-700 hover:border-brand-300 dark:hover:border-brand-600"
          : "border-gray-200 dark:border-dark-700 opacity-60"
        }
        transition-all duration-200 hover:shadow-md
        overflow-hidden cursor-pointer
      `}
      onClick={() => item.isAvailable && onAdd(item)}
      role="button"
      tabIndex={item.isAvailable ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === "Enter" && item.isAvailable) onAdd(item);
      }}
    >
      {/* Image */}
      <div className="relative h-28 bg-gray-100 dark:bg-dark-700 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-dark-500">
            <ImageOff size={28} />
          </div>
        )}

        {/* Favorite Badge */}
        {item.isFavorite && (
          <div className="absolute top-2 left-2">
            <Star size={14} className="text-yellow-400 fill-yellow-400" />
          </div>
        )}

        {/* Availability Badge */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="warning" size="md">Habis</Badge>
          </div>
        )}

        {/* Add Button */}
        {item.isAvailable && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(item);
              }}
              className="p-1.5 bg-brand-600 text-white rounded-full hover:bg-brand-700 shadow-lg"
              aria-label={`Tambah ${item.name}`}
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm text-gray-900 dark:text-dark-50 truncate">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5 line-clamp-1">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
            {formatCurrency(item.price)}
          </span>
          {item.estimatedMinutes && (
            <span className="text-xs text-gray-400 dark:text-dark-500">
              ~{item.estimatedMinutes}m
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
