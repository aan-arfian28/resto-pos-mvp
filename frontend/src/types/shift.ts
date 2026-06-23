export interface Shift {
  id: string;
  cashierId: string;
  cashierName?: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  totalSales: number;
  totalOrders: number;
  status: "open" | "closed";
  notes?: string;
}
