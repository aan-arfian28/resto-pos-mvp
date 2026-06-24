"use client";

import { create } from "zustand";
import type { OrderType } from "@/types";

interface PosState {
  orderMode: OrderType;
  tableNumber: string;
  isOnline: boolean;
  isShiftOpen: boolean;
  activeView: "menu" | "hold" | "payment";
  heldBills: Array<{ id: string; orderNumber: string; itemCount: number; total: number; heldAt: string }>;

  setOrderMode: (mode: OrderType) => void;
  setTableNumber: (table: string) => void;
  setOnlineStatus: (online: boolean) => void;
  setShiftOpen: (open: boolean) => void;
  setActiveView: (view: "menu" | "hold" | "payment") => void;
  addHeldBill: (bill: PosState["heldBills"][0]) => void;
  removeHeldBill: (id: string) => void;
  resetOrder: () => void;
}

export const usePosStore = create<PosState>((set) => ({
  orderMode: "dine_in",
  tableNumber: "",
  isOnline: true,
  isShiftOpen: false,
  activeView: "menu",
  heldBills: [],

  setOrderMode: (mode) => set({ orderMode: mode }),
  setTableNumber: (table) => set({ tableNumber: table }),
  setOnlineStatus: (online) => set({ isOnline: online }),
  setShiftOpen: (open) => set({ isShiftOpen: open }),
  setActiveView: (view) => set({ activeView: view }),

  addHeldBill: (bill) =>
    set((state) => ({ heldBills: [...state.heldBills, bill] })),

  removeHeldBill: (id) =>
    set((state) => ({ heldBills: state.heldBills.filter((b) => b.id !== id) })),

  resetOrder: () => set({ tableNumber: "", activeView: "menu" }),
}));
