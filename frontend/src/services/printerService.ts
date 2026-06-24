import { api } from "./api";

interface Printer {
  id: string;
  name: string;
  type: "kitchen" | "receipt";
  ip_address?: string;
  port: number;
  active: boolean;
}

export const printerService = {
  list: () => api.get<Printer[]>("/printers"),
  get: (id: string) => api.get<Printer>(`/printers/${id}`),
  create: (data: Partial<Printer>) => api.post<Printer>("/printers", data),
  update: (id: string, data: Partial<Printer>) => api.put<Printer>(`/printers/${id}`, data),
  delete: (id: string) => api.delete(`/printers/${id}`),
  testPrint: (id: string) => api.post(`/printers/${id}/test`),
};
