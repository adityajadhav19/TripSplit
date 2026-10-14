const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(paise: number): string {
  if (!Number.isSafeInteger(paise)) {
    return "—";
  }

  return inrFormatter.format(paise / 100);
}