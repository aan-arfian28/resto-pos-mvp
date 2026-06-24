import { api } from "./api";

export const shiftService = {
  getActive: async () => {
    return api.get("/shift/active");
  },

  openShift: async (modalAwal: number) => {
    return api.post("/shift/open", { modal_awal: modalAwal });
  },

  endShift: async (saldoAktual?: number) => {
    const body = saldoAktual !== undefined ? { saldo_aktual: saldoAktual } : {};
    return api.post("/shift/end", body);
  },
};
