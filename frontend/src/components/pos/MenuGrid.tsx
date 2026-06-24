"use client";

import React, { useEffect, useMemo } from "react";
import { useMenuStore } from "@/stores/menuStore";
import { useCartStore } from "@/stores/cartStore";
import { MenuCard } from "./MenuCard";
import type { MenuItem } from "@/types";
import { Spinner } from "@/components/ui/Spinner";

export function MenuGrid() {
  const { items, selectedCategoryId, loading, error, fetchMenu, setSelectedCategory } = useMenuStore();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => { fetchMenu(); }, []);

  // Derive categories from loaded menu items (no need for separate API call)
  const categories = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    for (const item of items) {
      if (item.category && !seen.has(item.category.id)) {
        seen.set(item.category.id, item.category);
      }
    }
    return Array.from(seen.values());
  }, [items]);

  const filteredItems = selectedCategoryId
    ? items.filter((item) => item.category_id === selectedCategoryId)
    : items;

  const handleAddItem = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.base_price,
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500 text-sm">{error}</p>
        <button onClick={fetchMenu} className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 px-1 shrink-0">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !selectedCategoryId
              ? "bg-brand-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedCategoryId === cat.id
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><Spinner size="lg" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-dark-500">
            <p className="text-sm">Tidak ada menu</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleAddItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
