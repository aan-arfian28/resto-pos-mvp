import { api } from "./api";
import type { MenuItem, MenuCategory } from "@/types";

export const menuService = {
  getMenu: async (params?: { categoryId?: string; isAvailable?: boolean }): Promise<MenuItem[]> => {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) queryParams.set("categoryId", params.categoryId);
    if (params?.isAvailable !== undefined) queryParams.set("isAvailable", String(params.isAvailable));

    const query = queryParams.toString();
    return api.get<MenuItem[]>(`/menu${query ? `?${query}` : ""}`);
  },

  getMenuItem: async (id: string): Promise<MenuItem> => {
    return api.get<MenuItem>(`/menu/${id}`);
  },

  getCategories: async (): Promise<MenuCategory[]> => {
    return api.get<MenuCategory[]>("/menu/categories");
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

  toggleAvailability: async (id: string): Promise<MenuItem> => {
    return api.patch<MenuItem>(`/menu/${id}/availability`);
  },
};
