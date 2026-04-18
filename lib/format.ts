const pkrFormatter = new Intl.NumberFormat("en-PK", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function formatPKR(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return "Rs. 0";
  return `Rs. ${pkrFormatter.format(Math.round(n))}`;
}

export function formatStock(qty: number, unit: string): string {
  return `${qty} ${unit}${qty === 1 ? "" : "s"}`;
}
