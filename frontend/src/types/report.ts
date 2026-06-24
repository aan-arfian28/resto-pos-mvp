export interface DailySales {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscount: number;
  averageOrderValue: number;
}

export interface TopItem {
  menu_item_id?: string;
  menuItemId?: string;
  item_name?: string;
  name?: string;
  total_qty?: number;
  quantity?: number;
  total_value?: number;
  revenue?: number;
  percentage?: number;
}

export interface SalesSummary {
  grossRevenue: number;
  netRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalTax: number;
  totalDiscount: number;
  totalDeliveryFee: number;
  totalServiceCharge: number;
  cashSales: number;
  nonCashSales: number;
  orderModeBreakdown: {
    "dine-in": number;
    takeaway: number;
    delivery: number;
  };
}

export interface Report {
  id: string;
  type: "daily" | "weekly" | "monthly" | "custom";
  shiftId?: string;
  cashierId?: string;
  summary: SalesSummary;
  topItems: TopItem[];
  dailySales: DailySales[];
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
}
