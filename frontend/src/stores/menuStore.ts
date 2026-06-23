"use client";

import { create } from "zustand";
import type { MenuItem, MenuCategory } from "@/types";
import { menuService } from "@/services/menuService";

interface MenuState {
  items: MenuItem[];
  categories: MenuCategory[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchMenu: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (categoryId: string | null) => void;
  getFilteredItems: () => MenuItem[];
  toggleFavorite: (itemId: string) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  categories: [],
  selectedCategoryId: null,
  isLoading: false,
  error: null,

  fetchMenu: async () => {
    set({ isLoading: true, error: null });
    try {
      const items = await menuService.getMenu();
      set({ items, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat menu";
      set({ error: message, isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await menuService.getCategories();
      set({ categories });
    } catch {
      // Silently fail - categories are not critical
    }
  },

  setSelectedCategory: (categoryId) => {
    set({ selectedCategoryId: categoryId });
  },

  getFilteredItems: () => {
    const { items, selectedCategoryId } = get();
    if (!selectedCategoryId) return items;
    return items.filter((item) => item.categoryId === selectedCategoryId);
  },

  toggleFavorite: (itemId) => {
    const updated = get().items.map((item) =>
      item.id === itemId ? { ...item, isFavorite: !item.isFavorite } : item
    );
    set({ items: updated });
  },
}));
