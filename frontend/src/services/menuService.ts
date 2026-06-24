import { api } from "./api";
import type { MenuItem, Category } from "@/types";

export const menuService = {
  // Menu Items
  getMenuItems: async (): Promise<MenuItem[]> => {
    return api.get<MenuItem[]>("/menu");
  },

  getMenuItem: async (id: string): Promise<MenuItem> => {
    return api.get<MenuItem>(`/menu/${id}`);
  },

  createMenuItem: async (data: Partial<MenuItem>): Promise<MenuItem> => {
    return api.post<MenuItem>("/menu", data);
  },

  updateMenuItem: async (id: string, data: Partial<MenuItem>): Promise<MenuItem> => {
    return api.put<MenuItem>(`/menu/${id}`, data);
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    return api.delete<void>(`/menu/${id}`);
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    return api.get<Category[]>("/categories");
  },

  createCategory: async (data: { name: string; parent_id?: string }): Promise<Category> => {
    return api.post<Category>("/categories", data);
  },

  updateCategory: async (id: string, data: { name?: string; parent_id?: string }): Promise<Category> => {
    return api.put<Category>(`/categories/${id}`, data);
  },

  deleteCategory: async (id: string): Promise<void> => {
    return api.delete<void>(`/categories/${id}`);
  },
};
