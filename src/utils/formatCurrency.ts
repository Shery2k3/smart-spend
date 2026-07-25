// Currency symbols mapping
const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  INR: "₹",
  PKR: "Rs.",
  AUD: "A$",
  CAD: "C$",
  CNY: "¥",
  BRL: "R$",
};

export const getCurrencySymbol = (currency: string): string => {
  return currencySymbols[currency] || currency;
};

export const formatNumber = (num: number): string => {
  const absNum = Math.abs(num);
  let formatted: string;

  if (absNum >= 1000000) {
    const millions = absNum / 1000000;
    formatted = millions % 1 === 0 ? Math.floor(millions) + 'M' : millions.toFixed(2).replace(/\.00$/, '') + 'M';
  } else if (absNum >= 1000) {
    const thousands = absNum / 1000;
    formatted = thousands % 1 === 0 ? Math.floor(thousands) + 'K' : thousands.toFixed(2).replace(/\.00$/, '') + 'K';
  } else {
    formatted = absNum % 1 === 0 ? Math.floor(absNum).toString() : absNum.toFixed(2);
  }

  return formatted;
};