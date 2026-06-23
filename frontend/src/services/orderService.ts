import { api } from "./api";
import type { Order } from "@/types";

export const orderService = {
  createOrder: async (data: {
    items: Array<{
      menuItemId: string;
      quantity: number;
      spiceLevel?: number;
      notes?: string;
      price: number;
    }>;
    mode: "dine-in" | "takeaway" | "delivery";
    tableNumber?: string;
    customerName?: string;
    paymentMethod?: string;
    amountPaid?: number;
    notes?: string;
  }): Promise<Order> => {
    return api.post<Order>("/orders", data);
  },

  getOrders: async (params?: {
    status?: string;
    date?: string;
    shiftId?: string;
  }): Promise<Order[]> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.set("status", params.status);
    if (params?.date) queryParams.set("date", params.date);
    if (params?.shiftId) queryParams.set("shiftId", params.shiftId);

    const query = queryParams.toString();
    return api.get<Order[]>(`/orders${query ? `?${query}` : ""}`);
  },

  getOrder: async (id: string): Promise<Order> => {
    return api.get<Order>(`/orders/${id}`);
  },

  voidOrderItem: async (
    orderId: string,
    itemId: string,
    reason: "Salah Input" | "Pelanggan Batal"
  ): Promise<Order> => {
    return api.patch<Order>(`/orders/${orderId}/items/${itemId}/void`, { reason });
  },

  processPayment: async (
    orderId: string,
    payment: {
      method: string;
      amount: number;
      change?: number;
    }
  ): Promise<Order> => {
    return api.post<Order>(`/orders/${orderId}/payment`, payment);
  },

  holdOrder: async (orderId: string): Promise<Order> => {
    return api.patch<Order>(`/orders/${orderId}/hold`);
  },

  resumeOrder: async (orderId: string): Promise<Order> => {
    return api.patch<Order>(`/orders/${orderId}/resume`);
  },

  getHeldOrders: async (): Promise<Order[]> => {
    return api.get<Order[]>("/orders/held");
  },

  batchSync: async (orders: Order[]): Promise<{ synced: number; failed: number }> => {
    return api.post<{ synced: number; failed: number }>("/orders/batch-sync", { orders });
  },
};
