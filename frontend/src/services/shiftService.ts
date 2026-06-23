import { api } from "./api";
import type { Shift } from "@/types";

export const shiftService = {
  getActive: async (): Promise<Shift | null> => {
    try {
      const result = await api.get<Shift>("/shifts/active");
      return result;
    } catch {
      return null;
    }
  },

  getShifts: async (params?: { cashierId?: string; status?: string }): Promise<Shift[]> => {
    const queryParams = new URLSearchParams();
    if (params?.cashierId) queryParams.set("cashierId", params.cashierId);
    if (params?.status) queryParams.set("status", params.status);

    const query = queryParams.toString();
    return api.get<Shift[]>(`/shifts${query ? `?${query}` : ""}`);
  },

  openShift: async (data: {
    openingBalance: number;
    notes?: string;
  }): Promise<Shift> => {
    return api.post<Shift>("/shifts", data);
  },

  endShift: async (id: string, data: {
    closingBalance: number;
    notes?: string;
  }): Promise<Shift> => {
    return api.post<Shift>(`/shifts/${id}/close`, data);
  },

  getZReport: async (shiftId: string) => {
    return api.get(`/shifts/${shiftId}/z-report`);
  },
};
