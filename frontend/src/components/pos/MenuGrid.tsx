"use client";

import React, { useEffect } from "react";
import { useMenuStore } from "@/stores/menuStore";
import { useCartStore } from "@/stores/cartStore";
import { MenuCard } from "./MenuCard";
import type { MenuItem } from "@/types";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";

export function MenuGrid() {
  const {
    items,
    categories,
    selectedCategoryId,
    isLoading,
    error,
    fetchMenu,
    fetchCategories,
    setSelectedCategory,
  } = useMenuStore();

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, [fetchMenu, fetchCategories]);

  const filteredItems = selectedCategoryId
    ? items.filter((item) => item.categoryId === selectedCategoryId)
    : items;

  const handleAddItem = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-red-500">Gagal memuat menu</p>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={fetchMenu}
          className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 px-1 scrollbar-thin shrink-0">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`
            shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
            ${!selectedCategoryId
              ? "bg-brand-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600"
            }
          `}
        >
          Semua
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap
              ${selectedCategoryId === cat.id
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600"
              }
            `}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="lg" label="Memuat menu..." />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-dark-500">
            <p className="text-lg">Tidak ada menu</p>
            <p className="text-sm mt-1">
              {selectedCategoryId
                ? "Tidak ada item dalam kategori ini"
                : "Menu belum tersedia"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={handleAddItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
