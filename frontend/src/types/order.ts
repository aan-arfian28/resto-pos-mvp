export type OrderType = "dine_in" | "takeaway" | "delivery";
export type OrderStatus = "draft" | "completed" | "voided";
export type PaymentMethod = "cash" | "debit" | "credit" | "qris" | "other";
export type VoidReason = "Salah Input" | "Pelanggan Batal";

export interface OrderItem {
  id: string;
  order_id?: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  notes?: string;
  is_void?: boolean;
  void_reason?: string;
  created_at?: string;
  menu_item?: { name: string; base_price: number };
}

export interface Order {
  id: string;
  shift_id?: string;
  user_id: string;
  type: OrderType;
  table_number?: string;
  tax_enabled: boolean;
  tax_rate: number;
  tax_amount: number;
  subtotal: number;
  grand_total: number;
  payment_method: PaymentMethod;
  amount_received?: number;
  change_amount?: number;
  status: OrderStatus;
  is_synced: boolean;
  original_timestamp?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Payment {
  method: PaymentMethod;
  amount: number;
  change?: number;
}
