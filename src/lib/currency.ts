export type CurrencyPosition = "left" | "right" | "left_space" | "right_space";

export type CurrencySettings = {
  code: string;
  symbol: string;
  thousandSep: string;
  decimalSep: string;
  decimals: number;
  position: CurrencyPosition;
};

export const CURRENCIES: { code: string; symbol: string; name: string }[] = [
  { code: "IDR", symbol: "Rp", name: "Rupiah Indonesia" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "MYR", symbol: "RM", name: "Ringgit Malaysia" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

export const DEFAULT_CURRENCY: CurrencySettings = {
  code: "IDR",
  symbol: "Rp",
  thousandSep: ".",
  decimalSep: ",",
  decimals: 0,
  position: "left_space",
};

export function formatNumber(value: number, cfg: Pick<CurrencySettings, "thousandSep" | "decimalSep" | "decimals">) {
  const decimals = Math.max(0, Math.min(4, Number(cfg.decimals) || 0));
  const fixed = Math.abs(value).toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, cfg.thousandSep);
  const sign = value < 0 ? "-" : "";
  return sign + (decPart ? `${withSep}${cfg.decimalSep}${decPart}` : withSep);
}

export function formatCurrency(value: number, cfg: CurrencySettings = DEFAULT_CURRENCY) {
  const num = formatNumber(value, cfg);
  switch (cfg.position) {
    case "left":
      return `${cfg.symbol}${num}`;
    case "right":
      return `${num}${cfg.symbol}`;
    case "right_space":
      return `${num} ${cfg.symbol}`;
    case "left_space":
    default:
      return `${cfg.symbol} ${num}`;
  }
}
