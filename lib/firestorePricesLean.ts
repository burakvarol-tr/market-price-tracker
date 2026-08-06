import { unstable_cache } from "next/cache";
import { db } from "./firebaseAdmin";
import type { MarketName } from "./getPrice";
import type { PriceRecord } from "./firestorePrices";
import { getFixedProductImage } from "./productImages";

const COLLECTION_LATEST = "latest_prices";

function normalizePrice(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.replace(",", ".").trim())
        : Number.NaN;

  if (Number.isNaN(parsed)) return null;
  return Number((parsed >= 1000 ? parsed / 100 : parsed).toFixed(2));
}

async function readLatestPricesLean(): Promise<PriceRecord[]> {
  if (!db) {
    throw new Error("Firestore bağlantısı yok. Env değerlerini kontrol et.");
  }

  const snap = await db.collection(COLLECTION_LATEST).get();

  return snap.docs
    .map((doc) => {
      const data = doc.data();
      const sku = String(data.sku ?? doc.id);
      const currentPrice = normalizePrice(data.currentPrice);
      const previousPrice = normalizePrice(data.previousPrice);

      return {
        sku,
        name: String(data.name ?? ""),
        market: (data.market ?? "A101") as MarketName,
        currentPrice,
        previousPrice,
        changed: previousPrice !== null && currentPrice !== null && previousPrice !== currentPrice,
        changePercent:
          typeof data.changePercent === "number" ? data.changePercent : null,
        inStock: Boolean(data.inStock),
        updatedAt: String(data.updatedAt ?? data.lastCheckedAt ?? ""),
        lastCheckedAt: String(data.lastCheckedAt ?? data.updatedAt ?? ""),
        lastChangedAt:
          typeof data.lastChangedAt === "string" ? data.lastChangedAt : null,
        source: String(data.source ?? data.market ?? ""),
        imageUrl:
          typeof data.imageUrl === "string" && data.imageUrl.trim()
            ? data.imageUrl
            : getFixedProductImage(sku),
      } satisfies PriceRecord;
    })
    .sort((a, b) => {
      const marketOrder = a.market.localeCompare(b.market, "tr");
      return marketOrder !== 0 ? marketOrder : a.name.localeCompare(b.name, "tr");
    });
}

const getCachedLatestPrices = unstable_cache(
  readLatestPricesLean,
  ["latest-prices-lean-v3"],
  { revalidate: 600, tags: ["latest-prices"] }
);

export async function getLatestPricesLean(options?: { market?: string }) {
  const items = await getCachedLatestPrices();
  return options?.market
    ? items.filter((item) => item.market === options.market)
    : items;
}
