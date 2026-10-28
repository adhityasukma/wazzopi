export type TrackingCheckpoint = {
  date: string;
  desc: string;
  location?: string;
  status?: string;
};

export type TrackingResult = {
  success: boolean;
  courier: string;
  courierName: string;
  trackingNumber: string;
  status: "PENDING" | "PROCESSING" | "ON_PROCESS" | "DELIVERED" | "FAILED";
  statusLabel: string;
  receiverName?: string;
  checkpoints: TrackingCheckpoint[];
  isLive: boolean;
  error?: string;
};

export const SUPPORTED_COURIERS: { code: string; name: string }[] = [
  { code: "jne", name: "JNE Express" },
  { code: "jnt", name: "J&T Express" },
  { code: "sicepat", name: "SiCepat Ekspres" },
  { code: "anteraja", name: "Anteraja" },
  { code: "pos", name: "POS Indonesia" },
  { code: "tiki", name: "TIKI" },
  { code: "ninja", name: "Ninja Xpress" },
  { code: "lion", name: "Lion Parcel" },
  { code: "wahana", name: "Wahana Express" },
  { code: "ide", name: "ID Express" },
  { code: "spx", name: "Shopee Xpress" },
];

export function getCourierName(code: string): string {
  const found = SUPPORTED_COURIERS.find((c) => c.code.toLowerCase() === code.toLowerCase());
  return found ? found.name : code.toUpperCase();
}
