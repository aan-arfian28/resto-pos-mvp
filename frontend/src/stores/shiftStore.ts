"use client";

import { create } from "zustand";
import type { Shift } from "@/types";
import { shiftService } from "@/services/shiftService";

interface ShiftState {
  currentShift: Shift | null;
  isLoading: boolean;
  error: string | null;

  fetchActiveShift: () => Promise<void>;
  openShift: (openingBalance: number, notes?: string) => Promise<Shift>;
  endShift: (closingBalance: number, notes?: string) => Promise<void>;
  clearError: () => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  currentShift: null,
  isLoading: false,
  error: null,

  fetchActiveShift: async () => {
    set({ isLoading: true, error: null });
    try {
      const shift = await shiftService.getActive();
      set({ currentShift: shift, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal memuat shift";
      set({ error: message, isLoading: false });
    }
  },

  openShift: async (openingBalance, notes) => {
    set({ isLoading: true, error: null });
    try {
      const shift = await shiftService.openShift({ openingBalance, notes });
      set({ currentShift: shift, isLoading: false });
      return shift;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal membuka shift";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  endShift: async (closingBalance, notes) => {
    const { currentShift } = get();
    if (!currentShift) throw new Error("Tidak ada shift aktif");

    set({ isLoading: true, error: null });
    try {
      await shiftService.endShift(currentShift.id, { closingBalance, notes });
      set({ currentShift: null, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menutup shift";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
