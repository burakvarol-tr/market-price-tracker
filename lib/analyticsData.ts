import { unstable_cache } from "next/cache";
import { db } from "./firebaseAdmin";
import { getProductCategory, type ProductCategory } from "./productCategory";
import type { MarketName } from "./getPrice";

export type AnalyticsHistoryItem = {
  sku: string;
  name: string;
  market: MarketName;
  category: ProductCategory;
  price: number | null;
  previousPrice: number | null;
  changePercent: number | null;
  checkedAt: string;
  eventType?: string;
};

function ensureDb() {
  if (!db) throw new Error("Firestore bağlantısı yok.");
  return db;
}

function numberOrNull(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Number(value.toFixed(2));
}

async function readRecentAnalyticsHistory(days: number): Promise<AnalyticsHistoryItem[]> {
  const firestore = ensureDb();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const startIso = start.toISOString();

  const snap = await firestore
    .collection("price_history")
    .where("checkedAt", ">=", startIso)
    .orderBy("checkedAt", "desc")
    .limit(2000)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    const checkedAt = String(data.checkedAt ?? "");
    const name = String(data.name ?? "");

    return {
      sku: String(data.sku ?? ""),
      name,
      market: (data.market ?? "A101") as MarketName,
      category: getProductCategory(name),
      price: numberOrNull(data.price),
      previousPrice: numberOrNull(data.previousPrice),
      changePercent: numberOrNull(data.changePercent),
      checkedAt,
      eventType: typeof data.eventType === "string" ? data.eventType : undefined,
    };
  });
}

const getCached30DayHistory = unstable_cache(
  () => readRecentAnalyticsHistory(30),
  ["analytics-history-30d-v2"],
  { revalidate: 900 }
);

const getCached90DayHistory = unstable_cache(
  () => readRecentAnalyticsHistory(90),
  ["analytics-history-90d-v2"],
  { revalidate: 1800 }
);

export async function getRecentAnalyticsHistory(days = 30): Promise<AnalyticsHistoryItem[]> {
  if (days <= 30) return getCached30DayHistory();
  if (days <= 90) return getCached90DayHistory();
  return readRecentAnalyticsHistory(Math.min(days, 120));
}

export function isPriceChange(item: AnalyticsHistoryItem) {
  return item.eventType === "price_changed" || item.eventType === "price_and_stock_changed" ||
    (item.previousPrice !== null && item.price !== null && item.previousPrice !== item.price);
}

export function dateKeyInTurkey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
