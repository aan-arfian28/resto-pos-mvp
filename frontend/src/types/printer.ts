export interface Printer {
  id: string;
  name: string;
  type: "receipt" | "kitchen" | "label";
  ipAddress?: string;
  port?: number;
  isDefault: boolean;
  isActive: boolean;
  paperSize: "58mm" | "80mm";
}
