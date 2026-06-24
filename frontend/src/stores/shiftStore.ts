"use client";

import { create } from "zustand";
import { shiftService } from "@/services/shiftService";

interface Shift {
  id: string;
  user_id: string;
  modal_awal: number;
  status: "open" | "closed";
  start_time: string;
  end_time?: string;
  total_tunai?: number;
  total_void?: number;
  saldo_akhir?: number;
  saldo_aktual?: number;
}

interface ShiftState {
  currentShift: Shift | null;
  loading: boolean;
  error: string | null;

  fetchActiveShift: () => Promise<void>;
  openShift: (modalAwal: number) => Promise<void>;
  endShift: (saldoAktual?: number) => Promise<any>;
  clearError: () => void;
}

export const useShiftStore = create<ShiftState>((set) => ({
  currentShift: null,
  loading: false,
  error: null,

  fetchActiveShift: async () => {
    set({ loading: true, error: null });
    try {
      const shift = await shiftService.getActive();
      set({ currentShift: shift, loading: false });
    } catch {
      set({ currentShift: null, loading: false });
    }
  },

  openShift: async (modalAwal) => {
    set({ loading: true, error: null });
    try {
      const shift = await shiftService.openShift(modalAwal);
      set({ currentShift: shift, loading: false });
    } catch (err: any) {
      set({ error: err?.message || "Gagal membuka shift", loading: false });
      throw err;
    }
  },

  endShift: async (saldoAktual?) => {
    set({ loading: true, error: null });
    try {
      const report = await shiftService.endShift(saldoAktual);
      set({ currentShift: null, loading: false });
      return report;
    } catch (err: any) {
      set({ error: err?.message || "Gagal menutup shift", loading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
