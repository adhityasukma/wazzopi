export type CurrencyPosition = "left" | "right" | "left_space" | "right_space";

export type CurrencySettings = {
  code: string;
  symbol: string;
  thousandSep: string;
  decimalSep: string;
  decimals: number;
  position: CurrencyPosition;
};

export type CurrencyItem = {
  code: string;
  symbol: string;
  name: string;
  nameId: string;
  defaultDecimals?: number;
};

// Daftar mata uang dunia standar WooCommerce (110+ mata uang internasional)
export const CURRENCIES: CurrencyItem[] = [
  // Major & Southeast Asia
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", nameId: "Rupiah Indonesia", defaultDecimals: 0 },
  { code: "USD", symbol: "$", name: "United States Dollar", nameId: "Dolar Amerika Serikat", defaultDecimals: 2 },
  { code: "EUR", symbol: "€", name: "Euro", nameId: "Euro", defaultDecimals: 2 },
  { code: "GBP", symbol: "£", name: "British Pound", nameId: "Pound Sterling Inggris", defaultDecimals: 2 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", nameId: "Dolar Singapura", defaultDecimals: 2 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", nameId: "Ringgit Malaysia", defaultDecimals: 2 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", nameId: "Yen Jepang", defaultDecimals: 0 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", nameId: "Dolar Australia", defaultDecimals: 2 },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar", nameId: "Dolar Kanada", defaultDecimals: 2 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", nameId: "Franc Swiss", defaultDecimals: 2 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", nameId: "Yuan Tiongkok", defaultDecimals: 2 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", nameId: "Dolar Hong Kong", defaultDecimals: 2 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", nameId: "Dolar Selandia Baru", defaultDecimals: 2 },
  { code: "THB", symbol: "฿", name: "Thai Baht", nameId: "Baht Thailand", defaultDecimals: 2 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", nameId: "Peso Filipina", defaultDecimals: 2 },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", nameId: "Dong Vietnam", defaultDecimals: 0 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", nameId: "Won Korea Selatan", defaultDecimals: 0 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", nameId: "Rupee India", defaultDecimals: 2 },
  { code: "TWD", symbol: "NT$", name: "New Taiwan Dollar", nameId: "Dolar Baru Taiwan", defaultDecimals: 2 },
  { code: "BND", symbol: "B$", name: "Brunei Dollar", nameId: "Dolar Brunei", defaultDecimals: 2 },

  // Middle East & Africa
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", nameId: "Riyal Arab Saudi", defaultDecimals: 2 },
  { code: "AED", symbol: "د.إ", name: "United Arab Emirates Dirham", nameId: "Dirham Uni Emirat Arab", defaultDecimals: 2 },
  { code: "QAR", symbol: "ر.ق", name: "Qatari Riyal", nameId: "Riyal Qatar", defaultDecimals: 2 },
  { code: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar", nameId: "Dinar Kuwait", defaultDecimals: 3 },
  { code: "BHD", symbol: ".د.ب", name: "Bahraini Dinar", nameId: "Dinar Bahrain", defaultDecimals: 3 },
  { code: "OMR", symbol: "ر.ع.", name: "Omani Rial", nameId: "Rial Oman", defaultDecimals: 3 },
  { code: "JOD", symbol: "د.ا", name: "Jordanian Dinar", nameId: "Dinar Yordania", defaultDecimals: 3 },
  { code: "ILS", symbol: "₪", name: "Israeli New Shekel", nameId: "Shekel Baru Israel", defaultDecimals: 2 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", nameId: "Lira Turki", defaultDecimals: 2 },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", nameId: "Pound Mesir", defaultDecimals: 2 },
  { code: "ZAR", symbol: "R", name: "South African Rand", nameId: "Rand Afrika Selatan", defaultDecimals: 2 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", nameId: "Naira Nigeria", defaultDecimals: 2 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", nameId: "Shilling Kenya", defaultDecimals: 2 },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", nameId: "Cedi Ghana", defaultDecimals: 2 },
  { code: "MAD", symbol: "د.م.", name: "Moroccan Dirham", nameId: "Dirham Maroko", defaultDecimals: 2 },
  { code: "DZD", symbol: "د.ج", name: "Algerian Dinar", nameId: "Dinar Aljazair", defaultDecimals: 2 },
  { code: "TND", symbol: "د.ت", name: "Tunisian Dinar", nameId: "Dinar Tunisia", defaultDecimals: 3 },
  { code: "ETB", symbol: "Br", name: "Ethiopian Birr", nameId: "Birr Ethiopia", defaultDecimals: 2 },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", nameId: "Shilling Tanzania", defaultDecimals: 2 },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", nameId: "Shilling Uganda", defaultDecimals: 0 },
  { code: "MUR", symbol: "₨", name: "Mauritian Rupee", nameId: "Rupee Mauritius", defaultDecimals: 2 },

  // Europe (Non-Eurozone & Nordics)
  { code: "SEK", symbol: "kr", name: "Swedish Krona", nameId: "Krona Swedia", defaultDecimals: 2 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", nameId: "Krone Norwegia", defaultDecimals: 2 },
  { code: "DKK", symbol: "kr", name: "Danish Krone", nameId: "Krone Denmark", defaultDecimals: 2 },
  { code: "PLN", symbol: "zł", name: "Polish Zloty", nameId: "Zloty Polandia", defaultDecimals: 2 },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", nameId: "Koruna Ceko", defaultDecimals: 2 },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", nameId: "Forint Hungaria", defaultDecimals: 2 },
  { code: "RON", symbol: "lei", name: "Romanian Leu", nameId: "Leu Rumania", defaultDecimals: 2 },
  { code: "BGN", symbol: "лв", name: "Bulgarian Lev", nameId: "Lev Bulgaria", defaultDecimals: 2 },
  { code: "ISK", symbol: "kr", name: "Icelandic Króna", nameId: "Krona Islandia", defaultDecimals: 0 },
  { code: "RSD", symbol: "din", name: "Serbian Dinar", nameId: "Dinar Serbia", defaultDecimals: 2 },
  { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia", nameId: "Hryvnia Ukraina", defaultDecimals: 2 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", nameId: "Rubel Rusia", defaultDecimals: 2 },
  { code: "GEL", symbol: "₾", name: "Georgian Lari", nameId: "Lari Georgia", defaultDecimals: 2 },
  { code: "BAM", symbol: "KM", name: "Bosnia-Herzegovina Convertible Mark", nameId: "Mark Konvertibel Bosnia", defaultDecimals: 2 },
  { code: "ALL", symbol: "L", name: "Albanian Lek", nameId: "Lek Albania", defaultDecimals: 2 },

  // Americas
  { code: "BRL", symbol: "R$", name: "Brazilian Real", nameId: "Real Brasil", defaultDecimals: 2 },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", nameId: "Peso Meksiko", defaultDecimals: 2 },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso", nameId: "Peso Argentina", defaultDecimals: 2 },
  { code: "CLP", symbol: "CLP$", name: "Chilean Peso", nameId: "Peso Chili", defaultDecimals: 0 },
  { code: "COP", symbol: "COL$", name: "Colombian Peso", nameId: "Peso Kolombia", defaultDecimals: 2 },
  { code: "PEN", symbol: "S/", name: "Peruvian Sol", nameId: "Sol Peru", defaultDecimals: 2 },
  { code: "UYU", symbol: "$U", name: "Uruguayan Peso", nameId: "Peso Uruguay", defaultDecimals: 2 },
  { code: "BOB", symbol: "Bs", name: "Bolivian Boliviano", nameId: "Boliviano Bolivia", defaultDecimals: 2 },
  { code: "PYG", symbol: "₲", name: "Paraguayan Guaraní", nameId: "Guarani Paraguay", defaultDecimals: 0 },
  { code: "CRC", symbol: "₡", name: "Costa Rican Colón", nameId: "Colon Kosta Rika", defaultDecimals: 2 },
  { code: "DOP", symbol: "RD$", name: "Dominican Peso", nameId: "Peso Dominika", defaultDecimals: 2 },
  { code: "GTQ", symbol: "Q", name: "Guatemalan Quetzal", nameId: "Quetzal Guatemala", defaultDecimals: 2 },
  { code: "HNL", symbol: "L", name: "Honduran Lempira", nameId: "Lempira Honduras", defaultDecimals: 2 },
  { code: "NIO", symbol: "C$", name: "Nicaraguan Córdoba", nameId: "Cordoba Nikaragua", defaultDecimals: 2 },
  { code: "PAB", symbol: "B/.", name: "Panamanian Balboa", nameId: "Balboa Panama", defaultDecimals: 2 },
  { code: "JMD", symbol: "J$", name: "Jamaican Dollar", nameId: "Dolar Jamaika", defaultDecimals: 2 },
  { code: "TTD", symbol: "TT$", name: "Trinidad and Tobago Dollar", nameId: "Dolar Trinidad & Tobago", defaultDecimals: 2 },
  { code: "BSD", symbol: "B$", name: "Bahamian Dollar", nameId: "Dolar Bahama", defaultDecimals: 2 },
  { code: "BBD", symbol: "Bds$", name: "Barbadian Dollar", nameId: "Dolar Barbados", defaultDecimals: 2 },
  { code: "BZD", symbol: "BZ$", name: "Belize Dollar", nameId: "Dolar Belize", defaultDecimals: 2 },
  { code: "XCD", symbol: "EC$", name: "East Caribbean Dollar", nameId: "Dolar Karibia Timur", defaultDecimals: 2 },

  // South & Central Asia, Oceania
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", nameId: "Rupee Pakistan", defaultDecimals: 2 },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", nameId: "Taka Bangladesh", defaultDecimals: 2 },
  { code: "LKR", symbol: "Rs", name: "Sri Lankan Rupee", nameId: "Rupee Sri Lanka", defaultDecimals: 2 },
  { code: "NPR", symbol: "रू", name: "Nepalese Rupee", nameId: "Rupee Nepal", defaultDecimals: 2 },
  { code: "MMK", symbol: "K", name: "Myanmar Kyat", nameId: "Kyat Myanmar", defaultDecimals: 0 },
  { code: "KHR", symbol: "៛", name: "Cambodian Riel", nameId: "Riel Kamboja", defaultDecimals: 2 },
  { code: "LAK", symbol: "₭", name: "Lao Kip", nameId: "Kip Laos", defaultDecimals: 0 },
  { code: "MVR", symbol: "Rf", name: "Maldivian Rufiyaa", nameId: "Rufiyaa Maladewa", defaultDecimals: 2 },
  { code: "KZT", symbol: "₸", name: "Kazakhstani Tenge", nameId: "Tenge Kazakhstan", defaultDecimals: 2 },
  { code: "UZS", symbol: "so'm", name: "Uzbekistani Som", nameId: "Som Uzbekistan", defaultDecimals: 2 },
  { code: "MNT", symbol: "₮", name: "Mongolian Tögrög", nameId: "Tugrik Mongolia", defaultDecimals: 2 },
  { code: "FJD", symbol: "FJ$", name: "Fijian Dollar", nameId: "Dolar Fiji", defaultDecimals: 2 },
  { code: "PGK", symbol: "K", name: "Papua New Guinean Kina", nameId: "Kina Papua Nugini", defaultDecimals: 2 },
  { code: "WST", symbol: "WS$", name: "Samoan Tala", nameId: "Tala Samoa", defaultDecimals: 2 },
  { code: "VUV", symbol: "VT", name: "Vanuatu Vatu", nameId: "Vatu Vanuatu", defaultDecimals: 0 },
  { code: "XOF", symbol: "CFA", name: "West African CFA Franc", nameId: "Franc CFA Afrika Barat", defaultDecimals: 0 },
  { code: "XAF", symbol: "FCFA", name: "Central African CFA Franc", nameId: "Franc CFA Afrika Tengah", defaultDecimals: 0 },
  { code: "XPF", symbol: "₣", name: "CFP Franc", nameId: "Franc CFP Pasifik", defaultDecimals: 0 },
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
