import { DEFAULT_CURRENCY, type CurrencySettings } from "./currency";

export type GeneralSettings = {
  storeName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  mapUrl: string;
};

export type BankAccount = { bank: string; number: string; holder: string };

export type PaymentSettings = {
  bankTransfer: { enabled: boolean; accounts: BankAccount[] };
  cod: { enabled: boolean; fee: number };
  midtrans: { enabled: boolean; mode: "sandbox" | "production"; merchantId: string; clientKey: string; serverKey: string };
};

export type ShippingMethod = { id: string; name: string; cost: number; etd: string; enabled: boolean };

export type ShippingSettings = {
  originCity: string;
  methods: ShippingMethod[];
  freeShippingEnabled: boolean;
  freeShippingMin: number;
  pickupEnabled: boolean;
  binderbyteApiKey?: string;
};

export type OtherSettings = {
  metaTitle: string;
  metaDescription: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  taxPercent: number;
  orderPrefix: string;
  lowStockThreshold: number;
};

export type SmtpSettings = {
  enabled: boolean;
  host: string;
  port: number;
  encryption: "tls" | "ssl" | "none";
  authRequired: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
};

export type AllSettings = {
  general: GeneralSettings;
  currency: CurrencySettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  other: OtherSettings;
  smtp: SmtpSettings;
};

export const DEFAULT_SETTINGS: AllSettings = {
  general: {
    storeName: "Wazzopi",
    tagline: "Satu Teguk, Banyak Cerita",
    email: "halo@wazzopi.com",
    phone: "0812-3456-7890",
    address: "Jl. Kopi Nusantara No. 17",
    city: "Tangerang",
    province: "Banten",
    postalCode: "15111",
    country: "Indonesia",
    mapUrl: "",
  },
  currency: DEFAULT_CURRENCY,
  payment: {
    bankTransfer: {
      enabled: true,
      accounts: [
        { bank: "BCA", number: "1234567890", holder: "PT Wazzopi Kopi Nusantara" },
        { bank: "Mandiri", number: "1300012345678", holder: "PT Wazzopi Kopi Nusantara" },
      ],
    },
    cod: { enabled: true, fee: 5000 },
    midtrans: { enabled: false, mode: "sandbox", merchantId: "", clientKey: "", serverKey: "" },
  },
  shipping: {
    originCity: "Tangerang",
    methods: [
      { id: "jne-reg", name: "JNE Reguler", cost: 18000, etd: "2-3 hari", enabled: true },
      { id: "jnt-ez", name: "J&T Express", cost: 17000, etd: "2-3 hari", enabled: true },
      { id: "sicepat-best", name: "SiCepat BEST", cost: 25000, etd: "1 hari", enabled: true },
      { id: "gosend", name: "GoSend Same Day", cost: 30000, etd: "Hari yang sama", enabled: false },
    ],
    freeShippingEnabled: true,
    freeShippingMin: 300000,
    pickupEnabled: true,
  },
  other: {
    metaTitle: "Wazzopi — Satu Teguk, Banyak Cerita",
    metaDescription: "Kopi pilihan Nusantara, disangrai segar setiap minggu.",
    instagram: "https://instagram.com/wazzopi",
    facebook: "https://facebook.com/wazzopi",
    whatsapp: "6281234567890",
    taxPercent: 0,
    orderPrefix: "WZ",
    lowStockThreshold: 10,
  },
  smtp: {
    enabled: false,
    host: "",
    port: 587,
    encryption: "tls",
    authRequired: true,
    username: "",
    password: "",
    fromEmail: "",
    fromName: "Wazzopi Coffee",
  },
};

export type SettingsKey = keyof AllSettings;
