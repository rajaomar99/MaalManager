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

export function formatLastRestocked(date: string | null): string {
  if (!date) return "Never restocked";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Never restocked";
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diffDays < 0) return "Last restocked today";
  if (diffDays === 0) return "Last restocked today";
  if (diffDays === 1) return "Last restocked yesterday";
  return `Last restocked ${diffDays} days ago`;
}
