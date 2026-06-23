"use client";

import { create } from "zustand";
import type { OrderItem, VoidReason, PaymentMethod } from "@/types";
import { calculateTax } from "@/lib/taxCalculator";

interface PaymentState {
  method: PaymentMethod | null;
  amount: number;
  change: number;
}

interface CartState {
  items: OrderItem[];
  notes: string;
  payment: PaymentState | null;
  isPaid: boolean;

  // Computed
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  serviceCharge: number;
  serviceChargeRate: number;
  grandTotal: number;
  itemCount: number;

  // Actions
  addItem: (item: {
    menuItemId: string;
    name: string;
    price: number;
    spiceLevel?: number;
    notes?: string;
  }) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateSpiceLevel: (itemId: string, spiceLevel: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  voidItem: (itemId: string, reason: VoidReason) => void;
  setNotes: (notes: string) => void;
  setPayment: (method: PaymentMethod, amount: number, change: number) => void;
  clearPayment: () => void;
  markAsPaid: () => void;
  clearCart: () => void;
  setTaxRate: (rate: number) => void;
  setServiceChargeRate: (rate: number) => void;
  recalculate: () => void;
}

const TAX_RATE = 0.11;
const SERVICE_CHARGE_RATE = 0.05;

function calculateItemsTotal(items: OrderItem[]): number {
  return items
    .filter((item) => !item.isVoided)
    .reduce((sum, item) => sum + item.subtotal, 0);
}

function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  notes: "",
  payment: null,
  isPaid: false,
  subtotal: 0,
  taxRate: TAX_RATE,
  taxAmount: 0,
  serviceCharge: 0,
  serviceChargeRate: SERVICE_CHARGE_RATE,
  grandTotal: 0,
  itemCount: 0,

  addItem: (item) => {
    const { items } = get();

    // Check if item already exists in cart (without spice/notes distinction for simplicity)
    const existing = items.find(
      (i) => i.menuItemId === item.menuItemId && !i.isVoided
    );

    if (existing) {
      const updated = items.map((i) =>
        i.id === existing.id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
          : i
      );
      set({ items: updated });
    } else {
      const newItem: OrderItem = {
        id: generateItemId(),
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: 1,
        spiceLevel: item.spiceLevel as 0 | 1 | 2 | 3 | undefined,
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
    if (quantity < 1) {
      get().removeItem(itemId);
      return;
    }
    const updated = get().items.map((i) =>
      i.id === itemId
        ? { ...i, quantity, subtotal: quantity * i.price }
        : i
    );
    set({ items: updated });
    get().recalculate();
  },

  updateSpiceLevel: (itemId, spiceLevel) => {
    const updated = get().items.map((i) =>
      i.id === itemId ? { ...i, spiceLevel: spiceLevel as 0 | 1 | 2 | 3 } : i
    );
    set({ items: updated });
  },

  updateItemNotes: (itemId, notes) => {
    const updated = get().items.map((i) =>
      i.id === itemId ? { ...i, notes } : i
    );
    set({ items: updated });
  },

  voidItem: (itemId, reason) => {
    const updated = get().items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            isVoided: true,
            voidReason: reason,
            voidedAt: new Date().toISOString(),
          }
        : i
    );
    set({ items: updated });
    get().recalculate();
  },

  setNotes: (notes) => set({ notes }),

  setPayment: (method, amount, change) => {
    set({ payment: { method, amount, change } });
  },

  clearPayment: () => {
    set({ payment: null });
  },

  markAsPaid: () => {
    set({ isPaid: true });
  },

  clearCart: () => {
    set({
      items: [],
      notes: "",
      payment: null,
      isPaid: false,
      subtotal: 0,
      taxAmount: 0,
      serviceCharge: 0,
      grandTotal: 0,
      itemCount: 0,
    });
  },

  setTaxRate: (rate) => {
    set({ taxRate: rate });
    get().recalculate();
  },

  setServiceChargeRate: (rate) => {
    set({ serviceChargeRate: rate });
    get().recalculate();
  },

  recalculate: () => {
    const { items, taxRate, serviceChargeRate } = get();
    const subtotal = calculateItemsTotal(items);
    const nonVoided = items.filter((i) => !i.isVoided);
    const itemCount = nonVoided.reduce((sum, i) => sum + i.quantity, 0);

    const taxResult = calculateTax(subtotal, {
      taxRate,
      serviceChargeRate,
    });

    set({
      subtotal,
      itemCount,
      serviceCharge: taxResult.serviceCharge,
      taxAmount: taxResult.taxAmount,
      grandTotal: taxResult.grandTotal,
    });
  },
}));
