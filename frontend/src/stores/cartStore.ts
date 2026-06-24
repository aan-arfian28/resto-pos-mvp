"use client";

import { create } from "zustand";
import { calculateTax } from "@/lib/taxCalculator";

// Internal cart item (UI-friendly, not the same as backend OrderItem)
interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  isVoided: boolean;
  voidReason?: string;
  subtotal: number;
}

interface PaymentState {
  method: string;
  amount: number;
  change: number;
}

interface CartState {
  items: CartItem[];
  payment: PaymentState | null;
  isPaid: boolean;

  // Computed
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  itemCount: number;

  // Actions
  addItem: (item: { menuItemId: string; name: string; price: number; notes?: string }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  voidItem: (itemId: string, reason: string) => void;
  setPayment: (method: string, amount: number, change: number) => void;
  clearPayment: () => void;
  clearCart: () => void;
  setTaxRate: (rate: number) => void;
  recalculate: () => void;

  // Export for API call
  buildOrderPayload: (shiftId: string, orderType: string, tableNumber: string | null) => {
    shift_id: string;
    type: string;
    table_number: string | null;
    items: { menu_item_id: string; quantity: number; price: number; notes?: string }[];
    payment_method: string;
    amount_received?: number;
    original_timestamp: string;
  };
}

const DEFAULT_TAX_RATE = 0.11;

function calculateItemsTotal(items: CartItem[]): number {
  return items.filter((item) => !item.isVoided).reduce((sum, item) => sum + item.subtotal, 0);
}

function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  payment: null,
  isPaid: false,
  subtotal: 0,
  taxRate: DEFAULT_TAX_RATE,
  taxAmount: 0,
  grandTotal: 0,
  itemCount: 0,

  addItem: (item) => {
    const { items } = get();
    const existing = items.find((i) => i.menuItemId === item.menuItemId && !i.isVoided);

    if (existing) {
      const updated = items.map((i) =>
        i.id === existing.id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price } : i
      );
      set({ items: updated });
    } else {
      const newItem: CartItem = {
        id: generateItemId(),
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: 1,
        notes: item.notes,
        isVoided: false,
        subtotal: item.price,
      };
      set({ items: [...items, newItem] });
    }
    get().recalculate();
  },

  removeItem: (itemId) => {
    set({ items: get().items.filter((i) => i.id !== itemId) });
    get().recalculate();
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity < 1) { get().removeItem(itemId); return; }
    const updated = get().items.map((i) =>
      i.id === itemId ? { ...i, quantity, subtotal: quantity * i.price } : i
    );
    set({ items: updated });
    get().recalculate();
  },

  voidItem: (itemId, reason) => {
    const updated = get().items.map((i) =>
      i.id === itemId ? { ...i, isVoided: true, voidReason: reason } : i
    );
    set({ items: updated });
    get().recalculate();
  },

  setPayment: (method, amount, change) => set({ payment: { method, amount, change } }),
  clearPayment: () => set({ payment: null }),
  clearCart: () => set({ items: [], payment: null, isPaid: false, subtotal: 0, taxAmount: 0, grandTotal: 0, itemCount: 0 }),
  setTaxRate: (rate) => { set({ taxRate: rate }); get().recalculate(); },

  recalculate: () => {
    const { items, taxRate } = get();
    const subtotal = calculateItemsTotal(items);
    const nonVoided = items.filter((i) => !i.isVoided);
    const itemCount = nonVoided.reduce((sum, i) => sum + i.quantity, 0);
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

    set({ subtotal, itemCount, taxAmount, grandTotal });
  },

  buildOrderPayload: (shiftId, orderType, tableNumber) => {
    const { items, payment, subtotal, taxAmount, grandTotal, taxRate } = get();
    const activeItems = items.filter((i) => !i.isVoided);

    return {
      shift_id: shiftId,
      type: orderType,
      table_number: tableNumber,
      items: activeItems.map((i) => ({
        menu_item_id: i.menuItemId,
        quantity: i.quantity,
        price: i.price,
        notes: i.notes,
      })),
      payment_method: payment?.method || "cash",
      amount_received: payment?.amount,
      original_timestamp: new Date().toISOString(),
    };
  },
}));

