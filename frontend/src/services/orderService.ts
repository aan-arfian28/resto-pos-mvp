import { api } from "./api";

interface OrderItemRequest {
  menu_item_id: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface CreateOrderRequest {
  shift_id?: string;
  type: "dine_in" | "takeaway" | "delivery";
  table_number?: string;
  items: OrderItemRequest[];
  payment_method: "cash" | "debit" | "credit" | "qris" | "other";
  amount_received?: number;
  original_timestamp?: string;
}

interface OrderResponse {
  order_id: string;
  subtotal: number;
  tax_amount: number;
  grand_total: number;
  change_amount?: number;
}

export const orderService = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return api.post<OrderResponse>("/orders", data);
  },

  batchSync: async (orders: CreateOrderRequest[]): Promise<{ success: boolean; order_id: string; error?: string }[]> => {
    return api.post("/orders/batch", orders);
  },

  getOrder: async (id: string): Promise<any> => {
    return api.get(`/orders/${id}`);
  },
};
