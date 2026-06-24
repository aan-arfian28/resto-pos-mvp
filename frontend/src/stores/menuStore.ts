"use client";

import { create } from "zustand";
import { menuService } from "@/services/menuService";
import type { MenuItem } from "@/types";

interface MenuState {
  items: MenuItem[];
  selectedCategoryId: string | null;
  loading: boolean;
  error: string | null;

  fetchMenu: () => Promise<void>;
  setSelectedCategory: (categoryId: string | null) => void;
  getFilteredItems: () => MenuItem[];
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  selectedCategoryId: null,
  loading: false,
  error: null,

  fetchMenu: async () => {
    set({ loading: true, error: null });
    try {
      const items = await menuService.getMenuItems();
      set({ items: items || [], loading: false });
    } catch (err) {
      set({ error: "Gagal memuat menu", loading: false, items: [] });
    }
  },

  setSelectedCategory: (categoryId) => set({ selectedCategoryId: categoryId }),

  getFilteredItems: () => {
    const { items, selectedCategoryId } = get();
    if (!selectedCategoryId) return items;
    return items.filter((item) => item.category_id === selectedCategoryId);
  },
}));
