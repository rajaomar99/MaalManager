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
  
  // Calculate relative time ignoring timezone midnight shifts 
  // by calculating exact millisecond differences.
  const now = new Date();
  
  // Clear time portions to strictly compare active days (local time midnight to midnight)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const restockDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffMs = today.getTime() - restockDate.getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays <= 0) return "Restocked today";
  if (diffDays === 1) return "Restocked yesterday";
  return `Restocked ${diffDays} days ago`;
}
