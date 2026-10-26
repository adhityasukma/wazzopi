import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { DEFAULT_SETTINGS, type AllSettings, type SettingsKey } from "./settings-types";

function merge<T>(base: T, override: unknown): T {
  if (!override || typeof override !== "object" || Array.isArray(base)) return (override as T) ?? base;
  const out = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    const b = (base as Record<string, unknown>)[k];
    out[k] = b && typeof b === "object" && !Array.isArray(b) && typeof v === "object" && !Array.isArray(v)
      ? merge(b, v)
      : v;
  }
  return out as T;
}

export async function getSettings(): Promise<AllSettings> {
  const rows = await prisma.setting.findMany();
  const result = structuredClone(DEFAULT_SETTINGS);
  for (const row of rows) {
    const key = row.key as SettingsKey;
    if (!(key in result)) continue;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)[key] = merge(result[key], JSON.parse(row.value));
    } catch {
      /* abaikan nilai rusak */
    }
  }
  return result;
}

export async function saveSetting<K extends SettingsKey>(key: K, value: AllSettings[K]) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(value) },
    update: { value: JSON.stringify(value) },
  });
}
