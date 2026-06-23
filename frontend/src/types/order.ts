import type { SpiceLevel } from "./menu";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled"
  | "voided";

export type OrderMode = "dine-in" | "takeaway" | "delivery";

export type PaymentMethod = "cash" | "qris" | "debit" | "credit" | "gopay" | "ovo";

export type VoidReason = "Salah Input" | "Pelanggan Batal";

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  spiceLevel?: SpiceLevel;
  notes?: string;
  isVoided: boolean;
  voidReason?: VoidReason;
  voidedAt?: string;
  subtotal: number;
}

export interface Payment {
  method: PaymentMethod;
  amount: number;
  change?: number;
  reference?: string;
  paidAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  mode: OrderMode;
  tableNumber?: string;
  customerName?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  deliveryFee: number;
  serviceCharge: number;
  discount: number;
  grandTotal: number;
  payment?: Payment;
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded";
  cashierId: string;
  cashierName?: string;
  notes?: string;
  isHeld: boolean;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}
