export interface TaxResult {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  serviceCharge: number;
  serviceChargeRate: number;
  grandTotal: number;
}

const DEFAULT_TAX_RATE = 0.11; // 11% PPN
const DEFAULT_SERVICE_CHARGE_RATE = 0.05; // 5%

export function calculateTax(
  subtotal: number,
  options?: {
    taxRate?: number;
    includeTax?: boolean;
    serviceChargeRate?: number;
    includeServiceCharge?: boolean;
  }
): TaxResult {
  const taxRate = options?.includeTax !== false ? (options?.taxRate ?? DEFAULT_TAX_RATE) : 0;
  const serviceChargeRate =
    options?.includeServiceCharge !== false
      ? (options?.serviceChargeRate ?? DEFAULT_SERVICE_CHARGE_RATE)
      : 0;

  const serviceCharge = Math.round(subtotal * serviceChargeRate);
  const afterService = subtotal + serviceCharge;
  const taxAmount = Math.round(afterService * taxRate);
  const grandTotal = afterService + taxAmount;

  return {
    subtotal,
    taxRate,
    taxAmount,
    serviceCharge,
    serviceChargeRate,
    grandTotal,
  };
}

export function calculateOrderItemSubtotal(
  price: number,
  quantity: number,
  options?: { spiceLevel?: number; spiceSurcharge?: number }
): number {
  let itemPrice = price * quantity;

  if (options?.spiceLevel && options.spiceLevel > 0 && options.spiceSurcharge) {
    itemPrice += options.spiceLevel * options.spiceSurcharge * quantity;
  }

  return itemPrice;
}
