/**
 * Format a number to Indonesian Rupiah currency format.
 * Rp 1.000,00 -> display format
 * We use integer rupiah (no decimals) for POS display.
 */
export function formatCurrency(amount: number, showDecimal = false): string {
  if (amount == null || isNaN(amount)) return "Rp 0";

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatter = new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: showDecimal ? 2 : 0,
    maximumFractionDigits: showDecimal ? 2 : 0,
  });

  return `${isNegative ? "-" : ""}Rp ${formatter.format(absAmount)}`;
}

/**
 * Parse a rupiah string back to a number.
 * "Rp 1.500" -> 1500
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^0-9,-]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
