"use client";

import { create } from "zustand";
import type { OrderMode } from "@/types";

interface PosState {
  orderMode: OrderMode;
  tableNumber: string;
  customerName: string;
  isOnline: boolean;
  isShiftOpen: boolean;
  activeView: "menu" | "hold" | "payment";
  heldBills: Array<{
    id: string;
    orderNumber: string;
    itemCount: number;
    total: number;
    heldAt: string;
  }>;

  setOrderMode: (mode: OrderMode) => void;
  setTableNumber: (table: string) => void;
  setCustomerName: (name: string) => void;
  setOnlineStatus: (online: boolean) => void;
  setShiftOpen: (open: boolean) => void;
  setActiveView: (view: "menu" | "hold" | "payment") => void;
  addHeldBill: (bill: PosState["heldBills"][0]) => void;
  removeHeldBill: (id: string) => void;
  clearHeldBills: () => void;
  resetOrder: () => void;
}

export const usePosStore = create<PosState>((set) => ({
  orderMode: "dine-in",
  tableNumber: "",
  customerName: "",
  isOnline: true,
  isShiftOpen: false,
  activeView: "menu",
  heldBills: [],

  setOrderMode: (mode) => set({ orderMode: mode }),
  setTableNumber: (table) => set({ tableNumber: table }),
  setCustomerName: (name) => set({ customerName: name }),
  setOnlineStatus: (online) => set({ isOnline: online }),
  setShiftOpen: (open) => set({ isShiftOpen: open }),
  setActiveView: (view) => set({ activeView: view }),

  addHeldBill: (bill) =>
    set((state) => ({ heldBills: [...state.heldBills, bill] })),

  removeHeldBill: (id) =>
    set((state) => ({ heldBills: state.heldBills.filter((b) => b.id !== id) })),

  clearHeldBills: () => set({ heldBills: [] }),

  resetOrder: () =>
    set({
      tableNumber: "",
      customerName: "",
      activeView: "menu",
    }),
}));
